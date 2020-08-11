// 丢弃策略
const DISCARD_POLICY = {
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
};

module.exports = {
    DISCARD_POLICY,
};