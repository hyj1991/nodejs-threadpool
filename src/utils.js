const toString = Object.prototype.toString;
function isAsyncFunction(obj) {
    return toString.call(obj) === '[object AsyncFunction]';
}
module.exports = {
    isAsyncFunction,
};