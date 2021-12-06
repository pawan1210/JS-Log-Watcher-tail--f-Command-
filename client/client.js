const log_container = document.getElementsByClassName("log-container")[0];
const io = require("socket.io-client");
const socket = io("http://localhost:3000")

socket.on("connect", () => {
    console.log("connected");
});

socket.on("logs-added", (logs) => {
    var newNode = document.createElement('div');
    newNode.innerHTML = get_formatted_logs(logs);
    log_container.appendChild(newNode);
});

function get_formatted_logs(logs){
    formatted_logs = "";
    for(let i=0; i<logs.length; i++){
        formatted_logs += logs[i] + "<br>";
    }
    return formatted_logs
}