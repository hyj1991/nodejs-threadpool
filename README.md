# nodejs-threadpool
基于nodejs worker_threads的线程池。

目前是基于文件执行的模式，和使用worker_threads一样。文件需要导出一个async函数。
功能
    <br/> 1 提供串行和并行两种模式，即单个子线程里处理任务时，是串行还是并行处理
    <br/> 2 任务分配时，支持随机、轮询、繁忙度三种策略。
    <br/> 3 工作线程空闲时间达到阈值，自动退出，异常退出的话，自动补充线程。支持定义线程池数量
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
async_1.js
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

性能测试
1 并发数一样的情况下，不同耗时的任务，平均的处理时间（时间少的为多线程）
![](https://img-blog.csdnimg.cn/2020080416313714.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RIRUFOQVJLSA==,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/2020080416315928.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RIRUFOQVJLSA==,size_16,color_FFFFFF,t_70)
并发数一样的情况下，越耗时的操作，线程池的好处越明显。
2 相同耗时的情况下，不同并发数对处理时间的影响
![](https://img-blog.csdnimg.cn/2020080416322012.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RIRUFOQVJLSA==,size_16,color_FFFFFF,t_70)
耗时一样的情况下，并发数越大，多线程的好处越明显。
3 相同并发数和任务的情况下，线程数对处理时间的影响
![](https://img-blog.csdnimg.cn/20200804163235798.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1RIRUFOQVJLSA==,size_16,color_FFFFFF,t_70)
线程越多，不一样性能越好。