const { Worker } = require('worker_threads');
const path = require('path');
const { EventEmitter } = require('events');

// 任务id
let workId = 0;
// 记录任务对应的Myworker对象
const workPool = {};
// 任务类，一个任务对应一个id
class Work {
    constructor({workId, filename, options}) {
        this.workId = workId;
        this.filename = filename;
        this.data = null;
        this.error = null;
        this.options = options;
    }
}
// 提供给用户的接口，对于用户来说，他看到的是一个任务对应一个线程（worker）
class MyWorker extends EventEmitter {
    constructor({ workId , threadId}) {
        super();
        this.threadId = threadId;
        workPool[workId] = this;
    }
}

const DISPATCH_POLICY = {
    DEFAULT: 0,
    RANDOM: 1,
    IN_TURN: 2,
};

// 线程池基类
class ThreadPool {
    constructor(options = {}) {
        this.options = options;
        this.workerQueue = [];
        this.lastSelectThread = -1;
    }
    init() {
        if (this.workerQueue.length) {
            return;
        }
        let { count, sync } = this.options;
        // 这里可以改成增量新增线程
        while(count--) {
            const worker = new Worker(path.resolve(__dirname, 'worker.js'), {workerData: { sync }});
            const node = {
                worker,
                // 该线程处理的任务数量
                queueLength: 0,
            };
            this.workerQueue.push(node);
            worker.on('exit', (status) => {
                // 异常退出则补充线程，正常退出则不补充
                if (status) {
                    this.workerQueue.push({
                        worker: new Worker(path.resolve(__dirname, 'worker.js'), {workerData: { sync }}),
                        queueLength: 0,
                    });
                }
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
                        if (EventEmitter.listenerCount(myWorker).length) {
                            myWorker.emit('error', error);
                        }
                        break;
                    default: break;
                }
            });
            worker.on('error', (...rest) => {
                console.log(...rest)
            });
        }
    }
    selectThead() {
         // 线程池中的线程数
         let { dispatchPolicy = DISPATCH_POLICY.DEFAULT, } = this.options;
        switch(dispatchPolicy) {
            case DISPATCH_POLICY.DEFAULT:
                let min = Number.MAX_SAFE_INTEGER;
                let i = 0;
                // 找出任务数最少的线程，把任务交给他
                for (; i < this.workerQueue.length; i++) {
                    const { queueLength } = this.workerQueue[i];
                    if (queueLength < min) {
                        min = i;
                    }
                }
                return this.workerQueue[min];
            case DISPATCH_POLICY.RANDOM:
                return this.workerQueue[~~(Math.random() * this.workerQueue.length)];
            case DISPATCH_POLICY.IN_TURN:
                return this.workerQueue[++this.lastSelectThread];
            default: return this.workerQueue[0];
        }
    }

    // 给线程池提交一个任务
    submit(filename, options = {}) {
        this.init();
        const id = ++workId;
        // 新建一个work，交给对应的子线程
        const work = new Work({ workId: id, filename, options });
        const thread = this.selectThead();
        thread.queueLength++;
        thread.worker.postMessage(work);
        // 新建一个Mywork，让用户以为自己在使用一个线程
        return new MyWorker({workId: id, threadId: thread.worker.threadId});
    }

    setOptions(options) {
        this.options = {...this.options, ...options};
    }
}

class AsyncThreadPool extends ThreadPool {
    constructor() {
        super({sync: false, count: 10});
    }
}

class SyncThreadPool extends ThreadPool {
    constructor() {
        super({sync: true, count: 10});
    }
}

const defaultSyncThread = new SyncThreadPool();
const defaultAsyncThread = new AsyncThreadPool();

module.exports = {
    AsyncThreadPool,
    SyncThreadPool,
    defaultAsyncThread,
    defaultSyncThread, 
    DISPATCH_POLICY,
}
