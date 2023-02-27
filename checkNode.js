const axios = require('axios');
const dotenv = require('dotenv');
const { logger } = require('ethers');
const readFile = require('./utils/readFile.js');
dotenv.config();


let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let getId = async(ip) => {
    let url = `http://${ip}:8000/status`;
    try{
        let res = await axios.get(url);
        return res.data;
    }catch(err){
        console.log(`${ip}---getId出错: ${err}`);
        return false
    }
};

// 查看节点是否活跃 ID在质押后可以通过getPeerId获取 get https://alice.muon.net/v1/?app=explorer&method=node&params\[id\]=7453
let checkActive = async(ip) => {
    let res = await getId(ip);
    if(res){
        if(("addedToNetwork" in res.node)){
            let addedToNetwork = res.node.addedToNetwork;
            if(addedToNetwork == true){
                if(("isOnline" in res.network.nodeInfo)){
                    let isOnline = res.network.nodeInfo.isOnline;
                    if(isOnline == true){
                        console.log(`${ip}---活跃`);
                    }else{
                        console.log(`${ip}---不活跃, 请稍后再检查...`);
                    };
                }else{
                    console.log(`${ip}---未质押`);
                };
            }else{
                console.log(`${ip}---未质押`);
            }
        };
    }else{
        console.log(`${ip}---节点无法访问`);
    }
};

let messages = readFile('./wallet.txt');
let main = async() => {
    logger.info(`正在检测节点是否活跃, 请稍等...`)
    for(let i = 0; i < messages.length; i++){
        let lines = messages[i].split('---');
        let ip = lines[0];
        // console.log(ip);
        await checkActive(ip);
        await sleep(1000 * 2)
    };
}

main()