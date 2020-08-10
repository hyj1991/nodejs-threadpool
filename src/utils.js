function isAsyncFunction(obj) {
    return toString.call(obj) === '[object AsyncFunction]';
}

module.exports = {
    isAsyncFunction,
};