const { Worker } = require('worker_threads');
const path = require('path');
const { EventEmitter } = require('events');

// 任务id
let workId = 0;
// 记录任务对应的Myworker对象
const workPool = {};
// 任务类，一个任务对应一个id
class Work {
    constructor({workId, filename}) {
        this.workId = workId;
        this.filename = filename;
        this.data = null;
        this.error = null;
    }
}
// 提供给用户的接口，对于用户来说，他看到的是一个任务对应一个线程（worker）
class MyWorker extends EventEmitter {
    constructor({ workId }) {
        super();
        workPool[workId] = this;
    }
}

// 线程池基类
class ThreadPool {
    constructor(options = {}) {
        // 线程
        this.workerQueue = [];
        // 线程池中的线程数
        let { count } = options;
        // 这里可以改成增量新增线程
        while(count--) {
            const worker = new Worker(path.resolve(__dirname, 'worker.js'), {workerData: {sync: options.sync}});
            const node = {
                worker,
                // 该线程处理的任务数量
                queueLength: 0,
            }
            this.workerQueue.push(node);
            // 线程退出，补充线程
            worker.on('exit', () => {
                this.workerQueue.push({
                    worker: new Worker(path.resolve(__dirname, 'worker.js'), {workerData: {sync: options.sync}}),
                    queueLength: 0,
                });
            });
            // 和子线程通信
            worker.on('message', (result) => {
                const {
                    work,
                    event,
                } = result;
                const { data, error, workId } = work;
                // 通过workId拿到对应的myWorker
                const myWorker = workPool[workId];
                delete workPool[workId];
                // 任务数减一
                node.queueLength--;
                switch(event) {
                    case 'done':
                        // 通知用户，任务完成
                        myWorker.emit('message', data);
                        break;
                    case 'error':
                        // 通知用户，任务出错
                        myWorker.emit('error', error);
                        break;
                    default: break;
                }
            });
            
        }
    }
    // 给线程池提交一个任务
    submit(options = {}) {
        if (typeof options === 'string') {
            options = {filename: options};
        }
        const { filename } = options;
        const id = ++workId;
        // 新建一个work，交给对应的子线程
        const work = new Work({ workId: id, filename });
        let min = Number.MAX_SAFE_INTEGER;
        let i = 0;
        // 找出任务数最少的线程，把任务交给他
        for (; i < this.workerQueue.length; i++) {
            const { queueLength } = this.workerQueue[i];
            if (queueLength < min) {
                min = i;
            }
        }
        this.workerQueue[min].queueLength++;
        this.workerQueue[min].worker.postMessage(work);
        // 新建一个Mywork，让用户以为自己在使用一个线程
        const worker = new MyWorker({workId: id});
        return worker;
    }
}

class AsyncThreadPool extends ThreadPool {
    static instance = null
    static getInstance(...rest) {
        if (AsyncThreadPool.instance) {
            return AsyncThreadPool.instance;
        }
        return (AsyncThreadPool.instance = new AsyncThreadPool(...rest));
    }
    constructor() {
        super({sync: false, count: 10});
    }
}

class SyncThreadPool extends ThreadPool {
    static instance = null
    static getInstance(...rest) {
        if (SyncThreadPool.instance) {
            return SyncThreadPool.instance;
        }
        return (SyncThreadPool.instance = new SyncThreadPool(...rest));
    }
    constructor() {
        super({sync: true, count: 10});
    }
}

module.exports = {
    AsyncThreadPool,
    SyncThreadPool,
    submitToSyncPool(...rest) {
        return SyncThreadPool.getInstance().submit(...rest);
    },
    submitToAsyncPool(...rest) {
        return AsyncThreadPool.getInstance().submit(...rest);
    }
}
