const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;


// 定义日志格式
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

let LOGSPATH = './logs.txt';

// 创建日志对象
const logger = createLogger({
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    myFormat
  ),
  transports: [
      new transports.Console(),
      new transports.File({ filename: LOGSPATH })
    ]
});

module.exports = logger;