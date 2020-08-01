const { submitToSyncPool } = require('../../threadPool');
const path = require('path');
const worker = submitToSyncPool(path.resolve(__dirname, 'event.js'));
worker.on('message', function() {
    console.log(...arguments)
})

worker.on('error', function() {
    console.log(...arguments)
})