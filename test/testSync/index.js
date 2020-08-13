const { defaultSyncThreadPool } = require('../../src').threadPool;
const path = require('path');
function test() {
    defaultSyncThreadPool.submit(path.resolve(__dirname, 'sync_1.js'), {name: 11});

    defaultSyncThreadPool.submit(path.resolve(__dirname, 'sync_2.js'), {name: 22}); 
}

test()