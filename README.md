# nodejs-threadpool
基于nodejs worker_threads的线程池。

支持文件和字符串模式，需要导出一个async函数。

1 默认提供的线程池类型
```cpp
// 异步处理任务
class AsyncThreadPool extends ThreadPool {
    constructor(options) {
        super({...options, sync: false});
    }
}
// 同步处理任务
class SyncThreadPool extends ThreadPool {
    constructor(options) {
        super({...options, sync: true});
    }
}
// cpu型的线程池，线程数和cpu核数一样，不支持动态扩容
class CPUThreadPool extends ThreadPool {
    constructor(options) {
        super({...options, coreThreads: cores, expansion: false});
    }
}
// 只有一个线程的线程池，不支持动态扩容，类型队列
class SingleThreadPool extends ThreadPool {
    constructor(options) {
        super({...options, coreThreads: 1, expansion: false });
    }
}
// 固定线程数的线程池，不支持动态扩容线程数
class FixedThreadPool extends ThreadPool {
    constructor(options) {
        super({ ...options, expansion: false });
    }
}

const defaultSyncThreadPool = new SyncThreadPool();
const defaultAsyncThreadPool = new AsyncThreadPool();
const defaultCpuThreadPool = new CPUThreadPool();
const defaultFixedThreadPool = new FixedThreadPool();
const defaultSingleThreadPool = new SingleThreadPool();
module.exports = {
    AsyncThreadPool,
    SyncThreadPool,
    CPUThreadPool,
    FixedThreadPool,
    SingleThreadPool,
    defaultAsyncThreadPool,
    defaultSyncThreadPool, 
    defaultCpuThreadPool,
    defaultFixedThreadPool,
    defaultSingleThreadPool,
}
```
2 用户可以自定义线程池类型和参数
```cpp
1 coreThreads：核心线程数，默认10个
2 maxThreads：最大线程数，默认50，只在支持动态扩容的情况下，该参数有效，否则该参数等于核心线程数
3 sync：线程处理任务的模式，同步则串行处理任务，异步则并行处理任务，不同步等待用户代码的执行结果
4 discardPolicy：任务超过阈值时的处理策略，策略如下
 	// 报错
    ABORT: 1,
    // 在主线程里执行
    CALLER_RUNS: 2,
    // 丢弃最老的的任务
    DISCARD_OLDEST: 3,
    // 丢弃
    DISCARD: 4,
    // 不丢弃
    NOT_DISCARD: 5,
5 preCreate：是否预创建线程池
6 maxIdleTime：线程空闲多久后自动退出
7 pollIntervalTime：线程隔多久轮询是否有任务需要处理
8 maxWork：线程池最大任务数 
9 expansion：是否支持动态扩容线程，阈值是最大线程数
```
3 用户可重写的接口
```cpp
generateWorkId：产生任务id函数
selectThead： 选择处理任务的函数，返回一个Node对象
submit：入参filename,为要支持的文件，options为支持文件时传入的参数。返回一个Promise。resolve的时候是UserWork对象，reject的时候是一个Error对象。
```
4 使用
例子1
index.js
```cpp
const { defaultSyncThreadPool } = require('nodejs-thread-pool').threadPool;
const path = require('path');
async function test() {
	const worker = await defaultSyncThread.submit(path.resolve(__dirname, 'event.js'));
	worker.on('done', function() {
        console.log(...arguments)
    })

    worker.on('error', function() {
        console.log(...arguments)
    })
}
test()
```
event.js

```cpp
module.exports = async function() {
    return await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({type: 'async event'});
            console.log(1)
        },3000)
    })
} 
```
例子2
```
const { defaultSyncThreadPool } = require('nodejs-thread-pool').threadPool;
const path = require('path');
async function test() {
    const work1 = await defaultSyncThread.submit('async function({a, b}) { return a + b; }', {a: 1, b: 1});
    work1.on('done',  function() {
        console.log(...arguments);
    })
    const work = await defaultSyncThread.submit(`async function(params) { return await new Promise((resolve) => {console.log(params); setTimeout(() => {resolve(1)}, 3000)})  }`, {name: 22}); 
    work.on('done', function() {
        console.log(...arguments);
    });
}

test()
```
