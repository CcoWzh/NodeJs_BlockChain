/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');
const CryptoJS = require('crypto-js');

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
        this.difficulty = 4;
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock() {
        // Add your code here
        let self = this;
        return new Promise(function (resolve, reject) {
            self.getBlockHeight()
                .then(height => {
                    if (height === 0) {
                        self.addBlock(new Block.Block("This is the genesis block"));
                        resolve(true);
                    } else
                        console.log("The genesis block is already existed")
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                })
        })
    }

    // Get block height, it is a helper method that return the height of the blockchain
    getBlockHeight() {
        // Add your code here
        let self = this;
        return new Promise(function (resolve, reject) {
            self.bd.getBlocksCount()
                .then(value => {
                    console.log("blockCount =" + value);
                    resolve(value);
                })
                .catch(err => {
                    console.log("Not found");
                    reject(err);
                })
        })
    }

    // Add new block
    addBlock(block) {
        // Add your code here
        let self = this;
        return new Promise(function (resolve, reject) {
            self.getBlockHeight()
                .then(height => {
                    block.height = height;
                    block.time = new Date().getTime().toString().slice(0, -3);
                    if (height > 0) {
                        self.getBlock(height - 1)
                            .then(preBlock => {
                                block.previousBlockHash = preBlock.hash;
                                let nonce = 0;
                                let nextHash = '';
                                while(!self.isValidHashDifficulty(nextHash)) {
                                    nonce = nonce + 1;
                                    nextHash = self.calculateHash(block.height,block.previousBlockHash, block.time, block.body, nonce);
                                }
                                block.hash = nextHash;
                                block.nonce = nonce;
                                console.log(block.hash);
                                self.bd.addLevelDBData(height, JSON.stringify(block));
                                resolve(true);
                            })
                            .catch(error => {
                                console.log(error);
                                reject(error);
                            });
                    } else {
                        console.log("block SHA256 is :",SHA256(JSON.stringify(block)).toString());
                        // block.nonce = 0;
                        block.hash = self.calculateHashForBlock(block);
                        console.log("block.hash is :",block.hash);
                        self.bd.addLevelDBData(height, JSON.stringify(block));
                        resolve(true);
                    }
                })
                .catch(error => {
                    console.log(error)
                    reject(error);
                });
        });
    }

    // Get Block By Height
    getBlock(height) {
        // Add your code here
        let self = this;
        return new Promise(function (resolve, reject) {
            self.bd.getLevelDBData(height)
                .then(block => {
                    resolve(JSON.parse(block));
                })
                .catch(err => {
                    console.log("Not found");
                    reject(err);
                })
        })
    }


    // 根据区块的索引确认区块是否有效,法一：
    validateBlock(height) {
        // Add your code here
        return this.getBlock(height)
            .then(block => {
                let blockHash = block.hash;
                block.hash = "";
                let validBlockHash = this.calculateHashForBlock(block);
                block.hash = blockHash;
                if (validBlockHash === blockHash) {
                    return Promise.resolve({isValidBlock: true, block: block});
                } else {
                    console.log('Block #' + height + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
                    return Promise.resolve({isValidBlock: false, block: block});
                }
            })
    }
    // 根据区块的索引确认区块是否有效,法二：
    validateBlock_2(height){
        return this.getBlock(height).then(
            block => {
                let preheight = block.height-1;
                this.getBlock(preheight).then(
                    previousBlock =>{
                        if(this.isValidNewBlock(block,previousBlock)){
                            console.log("YES");
                            return Promise.resolve({isValidBlock: true, block: block})
                        }else {
                            console.log("NO");
                            return Promise.reject({isValidBlock: false, block: block})
                        }
                    }
                )
            }
        )
    }

    //返回区块的哈希
    calculateHashForBlock (block) {
        return this.calculateHash(block.height, block.previousBlockHash, block.time, block.body, block.nonce)
    }
    // 拼接一串字符，返回其哈希
    calculateHash (index, previousHash, timestamp, data, nonce) {
        return CryptoJS.SHA256(index + previousHash + timestamp + data + nonce).toString()
    }

    //根据区块的前后对比确认新的区块是否有效
    isValidNewBlock (newBlock, previousBlock) {
        const blockHash = this.calculateHashForBlock(newBlock);

        if (previousBlock.height + 1 !== newBlock.height) {
            logger.log('❌  new block has invalid index')
            return false
        } else if (previousBlock.hash !== newBlock.previousBlockHash) {
            logger.log('❌  new block has invalid previous hash')
            return false
        } else if (blockHash !== newBlock.hash) {
            logger.log(`❌  invalid hash`)
            return false
        } else if (!this.isValidHashDifficulty(this.calculateHashForBlock(newBlock))) {
            logger.log(`❌  invalid hash does not meet difficulty requirements: ${this.calculateHashForBlock(newBlock)}`);
            return false;
        }
        return true
    }

    // 确认这条链是否有效
    validateChain() {
        // Add your code here
        let errorlog = [];
        let previousHash = '';
        let self = this;
        return new Promise(function (resolve, reject) {
            self.getBlockHeight()
                .then(height => {
                    for (let i = 0 ; i < height; i++) {
                        self.getBlock(i)
                            .then(block => self.validateBlock(block.height))
                            .then(({isValidBlock, block}) => {
                                if (!isValidBlock) errorlog.push(i);
                                if (block.previousBlockHash !== previousHash) errorlog.push(i);
                                previousHash = block.hash;
                                resolve(errorlog);
                            })
                    }
                })
        })

    }

    //判断是否是有效的哈希困难值
    isValidHashDifficulty(hash) {
        for (var i = 0, b = hash.length; i < b; i ++) {
            if (hash[i] !== '0') {
                break;
            }
        }
        return i === this.difficulty;
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }

}

module.exports.Blockchain = Blockchain;
