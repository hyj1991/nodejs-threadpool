const { parentPort, workerData } = require('worker_threads');
const { sync } = workerData;
const queue = [];
parentPort.on('message', (work) => {
    queue.push(work);
});

function poll() {
    setTimeout(async () => {
        if (queue.length) {
            const filename = queue.shift();
            if (sync) {
                const exportFunc = require(filename);
                if (typeof exportFunc === 'function') {
                    await exportFunc();
                }
            } else {
                require(filename);
            }
            parentPort.postMessage('done');
        }
        poll();
    }, 10);
}

poll();