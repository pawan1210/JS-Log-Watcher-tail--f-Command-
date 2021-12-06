const express = require("express");
const app = express();
const port = 3000;
const http = require("http").createServer();
const fs = require('fs');
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  }
});



const env_vars = require("./constants")
const log_file_path = env_vars.log_file_path
const event_name = env_vars.event_name

let startByte = 0;
let last_lines = [];


function get_reader(file_path, startByte, endByte){
  return new Promise((resolve, reject) => {
    const reader = fs.createReadStream(log_file_path, {
      start: startByte,
      end: endByte,
      encoding: 'UTF-8'
    });
    resolve(reader);
  });
}


function get_difference(reader){
  return new Promise((resolve, reject) => {
    reader.on("data", (data) => {
      resolve(data.split("\n"));
    });
  })
}

function fill_last_lines(data){
  let is_changed = false;
  last_lines = []
  for(let i=0; i<data.length; i++){
      if(data[i].length == 0)
        continue;
      if(last_lines.length == 10)
        last_lines.shift();
      last_lines.push(data[i]);
      is_changed = true;
  }

  return is_changed;
}

function add_new_logs(data){
  let is_changed = false;
  last_lines = []
  for(let i=0; i<data.length; i++){
      if(data[i].length == 0)
        continue;
      last_lines.push(data[i]);
      is_changed = true;
  }
  return is_changed
}
 


fs.stat(log_file_path, async (error, stats) => {
    let reader = await  get_reader(log_file_path, startByte, stats.size);
    let data = await get_difference(reader);
    fill_last_lines(data);
    startByte = stats.size;
});



fs.watchFile(log_file_path, (event, filename) => {
  fs.stat(log_file_path, async (error, stats) => {
      let reader = await  get_reader(log_file_path, startByte, stats.size);
      let data = await get_difference(reader);
      if(add_new_logs(data)){
        io.emit(event_name, last_lines);
        startByte = stats.size;
      }  
  });
});


io.on("connection", () => {
  io.emit(event_name, last_lines);
})


http.listen(env_vars.port, () => {
    console.log("Server Is Running Port: " + port);
});




/*
1. fs.stat to get the size of file.
2. Read data from 0 to size of file and emit an event to clients.
3. fs.watchFile to watch changes in the file. 
4. If some change happens get the new size and read content from prev size and new size;
5. get the newly added data/logs.
6. emit and event again

for large files - Used createReadStream(). It reads file in chunks instead of loading all the 
                  data in memory in one go.
for multiple clients - socket.io pn server side, socket-io.client on client side.
Dom manipulation is used to update the logs on every event. instead of refreshing.
*/