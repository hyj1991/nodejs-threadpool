const { parentPort, workerData } = require('worker_threads');
const vm = require('vm');
const { 
    sync,
    maxIdleTime,
    pollIntervalTime,
 } = workerData;
const queue = [];
const { isFunction } = require('./utils');
const jsFileRegexp = /\.js$/;
let lastWorkTime = Date.now();
// 监听主线程提交过来的任务
parentPort.on('message', ({cmd, work}) => {
    switch(cmd) {
        case 'delete':
            return queue.shift();
        case 'add':
            return queue.push(work);
    }
});

function poll() {
    const now = Date.now();
    if (now - lastWorkTime > maxIdleTime && !queue.length) {
        process.exit(0);
    }
    setTimeout(async () => {
        // 同步模式，线程执行完一个任务后再执行下一个
        if (sync) {
            while(queue.length) {
                const work = queue.shift();
                try {
                    const { filename, options } = work;
                    let aFunction;
                    if (jsFileRegexp.test(filename)) {
                        aFunction = require(filename);
                    } else {
                        aFunction = vm.runInThisContext(`(${filename})`);
                    }
                    
                    if (!isFunction(aFunction)) {
                        continue;
                    }
                    lastWorkTime = now;
                    
                    const result = await aFunction(options);
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
                    let aFunction
                    if (jsFileRegexp.test(filename)) {
                        aFunction = require(filename);
                    } else {
                        aFunction = vm.runInThisContext(`(${filename})`);
                    }
                    if (!isFunction(aFunction)) {
                        continue;
                    }
                    arr.push({aFunction, work});
                } catch (error) {
                    work.error = error.toString();
                    parentPort.postMessage({event: 'error', work});
                }
            }
            arr.map(async ({aFunction, work}) => {
                try {
                    const { options } = work;
                    lastWorkTime = now;
                    const result = await aFunction(options);
                    work.data = result;
                    parentPort.postMessage({event: 'done', work});
                } catch (e) {
                    work.error = error.toString();
                    parentPort.postMessage({event: 'done', work});
                }
            })
        }
        
        poll();
    }, pollIntervalTime);
}
// 轮询判断是否有任务
poll();

process.on('uncaughtException', (...rest) => {
    console.log(...rest);
});

process.on('unhandledRejection', (...rest) => {
    console.log(...rest);
});