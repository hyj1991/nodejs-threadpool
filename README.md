# nodejs-threadpool
基于nodejs worker_threads的线程池。

目前是基于文件执行的代码的模式，和使用worker_threads一样。文件需要导出一个async函数。
功能
    1 提供串行和并行两种模式，即单个子线程里处理任务时，是串行还是并行处理
    2 任务分配时，支持随机、轮询、繁忙度三种策略。
    3 工作线程空闲时间得到阈值，自动退出，异常退出的话，自动补充线程。支持定义线程池数量
导出的功能
```
module.exports = {
    AsyncThreadPool,
    SyncThreadPool,
    defaultAsyncThread,
    defaultSyncThread, 
    DISPATCH_POLICY,
}
```
使用例子
index.js
```
const { defaultSyncThread } = require('../../threadPool');
const path = require('path');
defaultSyncThread.submit(path.resolve(__dirname, 'sync_1.js'), {name: 1});
```
async_1
```
module.exports = async function() {
    return await new Promise((resolve) => {
        setTimeout(() => {
            resolve({type: 'async'})
            console.log(1, ...arguments)
        },3000)
    })
}
```