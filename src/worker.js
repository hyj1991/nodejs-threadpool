const { parentPort, workerData } = require('worker_threads');
const { sync } = workerData;
const queue = [];
const {
    MAX_IDLE_TIME,
    POLL_INTERVAL_TIME,
} = require('./config');
const { isAsyncFunction } = require('./utils');
let lastWorkTime = Date.now();
// 监听主线程提交过来的任务
parentPort.on('message', ({cmd, work}) => {
    switch(cmd) {
        case 'remove':
            return queue.unshift();
        case 'add':
            return queue.push(work);
    }
});

function poll() {
    const now = Date.now();
    if (now - lastWorkTime > MAX_IDLE_TIME && !queue.length) {
        process.exit(0);
    }
    setTimeout(async () => {
        // 同步模式，线程执行完一个任务后再执行下一个
        if (sync) {
            while(queue.length) {
                const work = queue.shift();
                try {
                    const { filename, options } = work;
                    const asyncFunction = require(filename);
                    if (!isAsyncFunction(asyncFunction)) {
                        return;
                    }
                    lastWorkTime = now;
                    
                    const result = await asyncFunction(options);
                    work.data = result;
                    parentPort.postMessage({event: 'done', work});
                } catch (error) {
                    work.error = error.toString();
                    parentPort.postMessage({event: 'error', work});
                }
            }
        } else {
            const arr = [];
            while(queue.length) {
                const work = queue.shift();
                try {
                    const { filename } = work;
                    const asyncFunction = require(filename);
                    if (!isAsyncFunction(asyncFunction)) {
                        return;
                    }
                    arr.push({asyncFunction, work});
                } catch (error) {
                    work.error = error.toString();
                    parentPort.postMessage({event: 'error', work});
                }
            }
            arr.map(async ({asyncFunction, work}) => {
                try {
                    const { options } = work;
                    lastWorkTime = now;
                    const result = await asyncFunction(options);
                    work.data = result;
                    parentPort.postMessage({event: 'done', work});
                } catch (e) {
                    work.error = error.toString();
                    parentPort.postMessage({event: 'done', work});
                }
            })
        }
        
        poll();
    }, POLL_INTERVAL_TIME);
}
// 轮询判断是否有任务
poll();

process.on('uncaughtException', (...rest) => {
    console.log(...rest);
});

process.on('unhandledRejection', (...rest) => {
    console.log(...rest);
});