# nodejs搭建区块链私链

- [ ] 增加功能：工作量证明

#### 解决问题：解决验证整个区块链时，异步调用问题

通过增加延迟函数`setTimeout`来延迟`resolve`的返回

```
// 确认这条链是否有效
    validateChain() {
        // Add your code here
        let errorlog = [];
        let self = this;
        return new Promise(function (resolve, reject) {
            self.getBlockHeight()
                .then(height => {
                    for (let i = 1; i < height; i++) {
                        self.getBlock(i)
                            .then(now_block => {
                                self.getBlock(now_block.height - 1).then(previousBlock => {
                                    if(!self.isValidNewBlock(now_block, previousBlock)) errorlog.push(i)
                                })
                            });
                    }
                    setTimeout(function () {
                        resolve(errorlog)
                    }, 1 * 1000);
                })
        })

    }
```

