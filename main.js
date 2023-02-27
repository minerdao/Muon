const axios = require('axios');
const ethers = require('ethers');
const dotenv = require('dotenv');
const logger = require('./utils/logs.js');
const mintAbi = require('./abi/mintAbi.json');
const readFile = require('./utils/readFile.js');
const proxyAbi = require('./abi/proxyAbi.json');
const approveAbi = require('./abi/approveAbi.json');

dotenv.config();

let provider = new ethers.providers.JsonRpcProvider(process.env.BSC_TESTNET_RPC);

let spender = "0x8d8377eDf14314B4c9c35C671955B63f92CF4bDC";
let mintContractAddress = "0x4ABC07AAB67eE61546D82b2142a92042B2ee8624";
let approveContractAddress= "0x84102df4b6bcb72114532241894b2077428a7f86";
let addMuonNodeContractAddress = "0x8d8377eDf14314B4c9c35C671955B63f92CF4bDC";

let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let getPeerId = async(ip) => {
    let url = `http://${ip}:8000/status`;
    try{
        let res = await axios.get(url);
        return {
            "address": res.data.address,
            "peerId": res.data.peerId
        }
    }catch(err){
        console.log(`${ip}---getPeerId出错: ${err}`);
        return false;
    }
}

let mint = async(wallet) => {
    let mintContract = new ethers.Contract(mintContractAddress, mintAbi, provider);
    
    let signer = mintContract.connect(wallet);
    try{
        let receipt = await signer.mintMuonTestToken(
        wallet.address,
        ethers.utils.parseUnits("1000", 18),
        );
        await receipt.wait();
        logger.info(`${wallet.address}---Mint成功: https://testnet.bscscan.com/tx/${receipt.hash}`);
        return true
    }catch(err){
        logger.info(`${wallet.address}---Mint失败: ${err}`);
        return false
    };
};

let approve = async(wallet) => {
    let approveContract = new ethers.Contract(approveContractAddress, approveAbi, provider);
    
    let signer = approveContract.connect(wallet);
    try{
        let receipt = await signer.approve(
        spender,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        );
        await receipt.wait();
        logger.info(`${wallet.address}---approve成功: https://testnet.bscscan.com/tx/${receipt.hash}`);
    }catch(err){
        logger.info(`${wallet.address}---approve失败: ${err}`);
    };
};

let addMuonNode = async(wallet, nodeAddress, peerId) => {
    let addMuonNodeContract = new ethers.Contract(addMuonNodeContractAddress, proxyAbi, provider);
    
    let signer = addMuonNodeContract.connect(wallet);
    try{
        let receipt = await signer.addMuonNode(
            nodeAddress,
            peerId,
            ethers.utils.parseUnits("1000", 18),
        );
        await receipt.wait();
        logger.info(`${wallet.address}---stake成功: https://testnet.bscscan.com/tx/${receipt.hash}`);
    }catch(err){
        logger.info(`${wallet.address}---stake失败: ${err}`);
    };
};


let run = async(pk, ip) => {
    let wallet = new ethers.Wallet(pk, provider);
    let result = await getPeerId(ip);
    if(result){
        logger.info(`${ip}---获取节点信息成功, 正在mint测试代币...`)
        let resultMint = await mint(wallet);
        if(resultMint){
            logger.info(`${ip}---Mint成功, 正在授权...`)
            await approve(wallet);
            logger.info(`${ip}---授权成功, 正在质押...`)
            await addMuonNode(wallet, result.address, result.peerId);
            logger.info(`${ip}---质押成功`)
        };
    }else{
        console.log(`${ip}---未获取到节点信息`);
    };
}

let messages = readFile('./wallet.txt');
let main = async() => {
    for(let i = 0; i < messages.length; i++){
        let lines = messages[i].split('---');
        let ip = lines[0];
        // let address = lines[1];
        let pk = lines[2];
        logger.info(`正在做 ${ip} 节点任务, 请稍后...`)
        await run(pk, ip);
        await sleep(1000 * 5);

    };
}

main();
