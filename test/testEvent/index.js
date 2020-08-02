const { defaultSyncThread, defaultAsyncThread } = require('../../threadPool');
const path = require('path');
const worker = defaultSyncThread.submit(path.resolve(__dirname, 'event.js'));
worker.on('message', function() {
    console.log(...arguments)
})

worker.on('error', function() {
    console.log(...arguments)
})

const asyncWorker = defaultAsyncThread.submit(path.resolve(__dirname, 'event.js'));
asyncWorker.on('message', function() {
    console.log('async', ...arguments)
})

asyncWorker.on('error', function() {
    console.log('async', ...arguments)
})