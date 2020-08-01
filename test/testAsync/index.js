const { submitToAsyncPool } = require('../../threadPool');
const path = require('path');
submitToAsyncPool(path.resolve(__dirname, 'async_1.js'));

submitToAsyncPool(path.resolve(__dirname, 'async_2.js'));