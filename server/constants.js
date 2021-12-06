require('dotenv').config()

const env_vars = {
    "port" : process.env.PORT,
    "log_file_path" : process.env.LOG_FILE_PATH, 
    "event_name": "logs-added"
}

module.exports = env_vars