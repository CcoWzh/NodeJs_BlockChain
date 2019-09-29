import test from "ava"
import BlockChain from "./BlockChain"
const Block = require('./Block.js');

test("test block",t =>{
    let block = new Block.Block("this is a block")
    t.is(block.body,"this is a block")
})

test("add new block", t => {
    let myBlockChain = new BlockChain.Blockchain();
    let blockTest = new Block.Block("Test Block - " + 1);
    myBlockChain.addBlock(blockTest);
    t.is(blockTest.height,0)
})