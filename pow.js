const spinner = require("./spinner")
const CryptoJS = require('crypto-js')

function generateNextBlock (blockData) {
    const previousBlock = "oxsssss";
    const nextIndex = 1;
    const nextTimestamp = new Date().getTime() / 1000
    let nonce = 0;
    let nextHash = '';

    while(!isValidHashDifficulty(nextHash)) {
        nonce = nonce + 1;
        nextHash = calculateHash(nextIndex, previousBlock, nextTimestamp, blockData, nonce);
        console.log(nextHash)
    }
    return {hash:nextHash,nonce:nonce};
}

function isValidHashDifficulty(hash) {
    for (var i = 0, b = hash.length; i < b; i ++) {
        if (hash[i] !== '0') {
            break;
        }
    }
    return i === 4;
}

function calculateHash (index, previousHash, timestamp, data, nonce) {
    return CryptoJS.SHA256(index + previousHash + timestamp + data + nonce).toString()
}

var x = generateNextBlock("hello")
console.log(x)