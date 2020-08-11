const { defaultSyncThread, defaultAsyncThread } = require('../../src').threadPool;
const path = require('path');
async function test() {
    const worker = await defaultSyncThread.submit(path.resolve(__dirname, 'event.js'));
    worker.on('done', function() {
        console.log(...arguments)
    })

    worker.on('error', function() {
        console.log(...arguments)
    })

    const asyncWorker = await defaultAsyncThread.submit(path.resolve(__dirname, 'event.js'));
    asyncWorker.on('done', function() {
        console.log('async', ...arguments)
    })

    asyncWorker.on('error', function() {
        console.log('async', ...arguments)
    })
}

test()