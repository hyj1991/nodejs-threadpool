const { Worker, threadId } = require('worker_threads');
const path = require('path');
const { EventEmitter } = require('events');
const os = require('os');
const { Work } = require('./work');
const { DISCARD_POLICY } = require('./constants');
const config = require('./config');
const cores = os.cpus().length;
const  { isAsyncFunction } = require('./utils');
// 任务id
let workId = 0;
// 记录任务对应的Myworker对象
const workPool = {};
const workerPath = path.resolve(__dirname, 'worker.js');
// 提供给用户的接口
class UserWork extends EventEmitter {
    constructor({ workId, threadId }) {
        super();
        this.workId = workId;
        this.threadId = threadId;
        workPool[workId] = this;
    }
}
class Node {
    constructor({worker}) {
        // nodejs的Worker对象
        this.worker = worker;
        // 该线程处理的任务数量
        this.queueLength = 0;
    }
}

// 线程池基类
class ThreadPool {
    constructor(options = {}) {
        this.options = options;
        // 线程池总任务数
        this.totalWork = 0;
        // 子线程队列
        this.workerQueue = [];
        // 核心线程数
        this.coreThreads = ~~options.coreThreads || config.CORE_THREADS;
        // 线程池最大线程数，如果不支持动态扩容则最大线程数等于核心线程数
        this.maxThreads = options.expansion !== false ? Math.max(this.coreThreads, config.MAX_THREADS) : this.coreThreads;
        // 工作线程处理任务的模式
        this.sync = options.sync !== false;
        // 超过任务队列长度时的处理策略
        this.discardPolicy = options.discardPolicy ? options.discardPolicy : DISCARD_POLICY.NOT_DISCARD;
        // 是否预创建子线程
        this.preCreate = options.preCreate === true;
        this.maxIdleTime = ~~options.maxIdleTime || config.MAX_IDLE_TIME;
        this.pollIntervalTime = ~~options.pollIntervalTime || config.POLL_INTERVAL_TIME;
        this.maxWork = ~~options.maxWork || config.MAX_WORK;
        // 是否预创建线程池
        this.preCreate && this.preCreateThreads();
    }
    // 预创建线程池，数量等于核心线程数
    preCreateThreads() {
        let { coreThreads } = this;
        while(coreThreads--) {
            this.newThread();
        }
    }
    // 创建线程
    newThread() {
        let { sync } = this;
        const worker = new Worker(workerPath, {workerData: { sync, maxIdleTime: this.maxIdleTime, pollIntervalTime: this.pollIntervalTime, }});
        const node = new Node({worker});
        this.workerQueue.push(node);
        const threadId = worker.threadId;
        worker.on('exit', (status) => {
            // 异常退出则补充线程，正常退出则不补充
            if (status) {
                this.newThread();
            }
            this.totalWork -= node.queueLength;
            this.workerQueue = this.workerQueue.filter(({worker}) => {
                return worker.threadId !== threadId;
            });
        });
        // 和子线程通信
        worker.on('message', (result) => {
            const {
                work,
                event,
            } = result;
            const { data, error, workId } = work;
            // 通过workId拿到对应的userWorker
            const userWorker = workPool[workId];
            delete workPool[workId];
            // 任务数减一
            node.queueLength--;
            this.totalWork--;
            switch(event) {
                case 'done':
                    // 通知用户，任务完成
                    userWorker.emit('done', data);
                    break;
                case 'error':
                    // 通知用户，任务出错
                    if (EventEmitter.listenerCount(userWorker, 'error')) {
                        userWorker.emit('error', error);
                    }
                    break;
                default: break;
            }
        });
        worker.on('error', (...rest) => {
            console.log(...rest)
        });
        return node;
    }
    // 选择处理任务的线程
    selectThead() {
        let min = Number.MAX_SAFE_INTEGER;
        let i = 0;
        let index = 0;
        // 找出任务数最少的线程，把任务交给他
        for (; i < this.workerQueue.length; i++) {
            const { queueLength } = this.workerQueue[i];
            if (queueLength < min) {
                index = i;
                min = queueLength;
            }
        }
        return this.workerQueue[index];
    }
    // 生成任务id
    generateWorkId() {
        return ++workId % Number.MAX_SAFE_INTEGER;
    }

    // 给线程池提交一个任务
    submit(filename, options = {}) {
        return new Promise(async (resolve, reject) => {
            let thread;
            // 没有线程则创建一个
            if (this.workerQueue.length) {
                thread = this.selectThead();
                // 任务队列非空
                if (thread.queueLength !== 0) {
                    // 子线程个数还没有达到核心线程数，则新建线程处理
                    if (this.workerQueue.length < this.coreThreads) {
                        thread = this.newThread();
                    } else if (this.totalWork + 1 > this.maxWork){
                        // 总任务数已达到阈值，还没有达到线程数阈值，则创建
                        if(this.workerQueue.length < this.maxThreads) {
                            thread = this.newThread();
                        } else {
                            // 处理溢出的任务
                            switch(this.discardPolicy) {
                                case DISCARD_POLICY.ABORT: 
                                    return reject(new Error('queue overflow'));
                                case DISCARD_POLICY.CALLER_RUNS: 
                                    const userWork =  new UserWork({workId: this.generateWorkId(), threadId}); 
                                    try {
                                        const asyncFunction = require(filename);
                                        if (!isAsyncFunction(asyncFunction)) {
                                            return reject(new Error('need export a async function'));
                                        }
                                        const result = await asyncFunction(options);
                                        resolve(userWork);
                                        setImmediate(() => {
                                            userWork.emit('done', result);
                                        });
                                    } catch (error) {
                                        resolve(userWork);
                                        setImmediate(() => {
                                            userWork.emit('error', error);
                                        });
                                    }
                                    return;
                                case DISCARD_POLICY.DISCARD_OLDEST: 
                                    thread.worker.postMessage({cmd: 'delete'});
                                    break;
                                case DISCARD_POLICY.DISCARD:
                                    return reject(new Error('discard'));
                                case DISCARD_POLICY.NOT_DISCARD:
                                    break;
                                default: 
                                    break;
                            }
                        }
                    }
                }
            } else {
                thread = this.newThread();
            }
            // 生成一个任务id
            const workId = this.generateWorkId();
            // 新建一个work，交给对应的子线程
            const work = new Work({ workId, filename, options });
            const userWork = new UserWork({workId, threadId: thread.worker.threadId});
            thread.queueLength++;
            this.totalWork++;
            thread.worker.postMessage({cmd: 'add', work});
            resolve(userWork);
        })
    }
}

class AsyncThreadPool extends ThreadPool {
    constructor(options) {
        super({...options, sync: false});
    }
}

class SyncThreadPool extends ThreadPool {
    constructor(options) {
        super({...options, sync: true});
    }
}

class CPUThreadPool extends ThreadPool {
    constructor(options) {
        super({...options, coreThreads: cores, expansion: false});
    }
}

class SingleThreadPool extends ThreadPool {
    constructor(options) {
        super({...options, coreThreads: 1, expansion: false });
    }
}

class FixedThreadPool extends ThreadPool {
    constructor(options) {
        super({ ...options, expansion: false });
    }
}

const defaultSyncThread = new SyncThreadPool();
const defaultAsyncThread = new AsyncThreadPool();
const defaultCpuThread = new CPUThreadPool();
const defaultFixedThreadPool = new FixedThreadPool();
const defaultSingleThreadPool = new SingleThreadPool();
module.exports = {
    AsyncThreadPool,
    SyncThreadPool,
    CPUThreadPool,
    FixedThreadPool,
    SingleThreadPool,
    defaultAsyncThread,
    defaultSyncThread, 
    defaultCpuThread,
    defaultFixedThreadPool,
    defaultSingleThreadPool,
}
