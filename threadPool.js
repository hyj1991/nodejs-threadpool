const { Worker, workerData } = require('worker_threads');
const path = require('path');

class ThreadPool {
    constructor(options = {}) {
        this.workerQueue = [];
        let { count } = options;
        while(count--) {
            const worker = new Worker(path.resolve(__dirname, 'worker.js'), {workerData: {sync: options.sync}});
            const node = {
                worker,
                queueLength: 0,
            }
            this.workerQueue.push(node);
            worker.on('exit', () => {
                this.workerQueue.push({
                    worker: new Worker(path.resolve(__dirname, 'worker.js'), {workerData: {sync: options.sync}}),
                    queueLength: 0,
                });
            });
            worker.on('message', (cmd) => {
                node.queueLength--;
            });
            
        }
    }

    
    submit(work) {
        let min = Number.MAX_SAFE_INTEGER;
        let i = 0;
        for (; i < this.workerQueue.length; i++) {
            const { queueLength } = this.workerQueue[i];
            if (queueLength < min) {
                min = i;
            }
        }
        this.workerQueue[min].queueLength++;
        this.workerQueue[min].worker.postMessage(work);
    }
}

class AsyncThreadPool extends ThreadPool {
    static instance = null
    static getInstance() {
        if (AsyncThreadPool.instance) {
            return AsyncThreadPool.instance;
        }
        return (AsyncThreadPool.instance = new AsyncThreadPool());
    }
    constructor() {
        super({sync: false, count: 10});
    }
}

class SyncThreadPool extends ThreadPool {
    static instance = null
    static getInstance() {
        if (SyncThreadPool.instance) {
            return SyncThreadPool.instance;
        }
        return (SyncThreadPool.instance = new SyncThreadPool());
    }
    constructor() {
        super({sync: true, count: 10});
    }
}

// SyncThreadPool.getInstance().submit(path.resolve(__dirname, '1.js'));

// SyncThreadPool.getInstance().submit(path.resolve(__dirname, '2.js'));

AsyncThreadPool.getInstance().submit(path.resolve(__dirname, 'async_1.js'));

AsyncThreadPool.getInstance().submit(path.resolve(__dirname, 'async_2.js'));