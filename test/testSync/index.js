const { submitToSyncPool } = require('../../threadPool');
const path = require('path');
submitToSyncPool(path.resolve(__dirname, '1.js'));

submitToSyncPool(path.resolve(__dirname, '2.js'));