module.exports = {
    // 最大的线程数
    MAX_THREADS: 50,
    // 线程池最大任务数
    MAX_WORK: Infinity,
    // 默认核心线程数
    CORE_THREADS: 10,
    // 最大空闲时间
    MAX_IDLE_TIME: 10 * 60 * 1000,
    // 子线程轮询时间
    POLL_INTERVAL_TIME: 10,
};