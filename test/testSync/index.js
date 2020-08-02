const { defaultSyncThread } = require('../../threadPool');
const path = require('path');
defaultSyncThread.submit(path.resolve(__dirname, 'sync_1.js'), {name: 1});

defaultSyncThread.submit(path.resolve(__dirname, 'sync_2.js'), {name: 2}); 