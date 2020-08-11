const { defaultSyncThread } = require('../../src').threadPool;
const path = require('path');
defaultSyncThread.submit(path.resolve(__dirname, 'sync_1.js'), {name: 11});

defaultSyncThread.submit(path.resolve(__dirname, 'sync_2.js'), {name: 22}); 