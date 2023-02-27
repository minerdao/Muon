const fs = require('fs');
const logger = require('./logs.js');

// 从磁盘读取文件，并以换行符分割，返回最终的列表
let readFile = (filePath) => {
    try{
        let data = fs.readFileSync(filePath, 'UTF-8');
        let lines = data.split(/\r?\n/);
        return lines
    }catch(err){
        logger.info(`文件读取失败: ${err}`);
        return
    }
};

module.exports = readFile;