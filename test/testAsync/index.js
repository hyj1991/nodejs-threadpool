const { defaultAsyncThread } = require('../../src').threadPool;
const path = require('path');
defaultAsyncThread.submit(path.resolve(__dirname, 'async_1.js'), {name: 1});

defaultAsyncThread.submit(path.resolve(__dirname, 'async_2.js'), {name: 2}); 