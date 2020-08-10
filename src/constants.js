const DISPATCH_POLICY = {
    DEFAULT: 0,
    RANDOM: 1,
    IN_TURN: 2,
};

const DISCARD_POLICY = {
    ABORT: 0,
    CALLER_RUNS: 1,
    DISCARD_OLDEST: 2,
    DISCARD: 3
};

const THREAD_POOL_TYPE = {
    CPU: 0,
    IO: 1,
    MIXED: 2,
};
module.exports = {
    DISPATCH_POLICY,
    DISCARD_POLICY,
    THREAD_POOL_TYPE,
};