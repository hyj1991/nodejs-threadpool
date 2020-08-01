const { parentPort, workerData } = require('worker_threads');
const { sync } = workerData;
const queue = [];
// 监听主线程提交过来的任务
parentPort.on('message', (work) => {
    queue.push(work);
});

function poll() {
    setTimeout(async () => {
        while(queue.length) {
            const work = queue.shift();
            const { filename } = work;
            // 同步模式，线程执行完一个任务后再执行下一个
            if (sync) {
                try {
                    const ret = await require(filename);
                    work.data = ret;
                    parentPort.postMessage({event: 'done', work});
                } catch (error) {
                    work.error = error;
                    parentPort.postMessage({event: 'error', work});
                }
            } else {
                try {
                    const result = require(filename);
                    if (typeof result.then === 'function') {
                        result.then((data) => {
                            work.data = data;
                            parentPort.postMessage({event: 'done', work});
                        }).catch((error) => {
                            work.error = error;
                            parentPort.postMessage({event: 'error', work});
                        })
                    } else {
                        work.data = result;
                        parentPort.postMessage({event: 'done', work});
                    }
                } catch (error) {
                    work.error = error;
                    parentPort.postMessage({event: 'error', work});
                }
            }
            
        }
        poll();
    }, 10);
}
// 轮询判断是否有任务
poll();

process.on('uncaughtException', (...rest) => {
    console.log(...rest);
});

process.on('unhandledRejection', (...rest) => {
    console.log(...rest);
});