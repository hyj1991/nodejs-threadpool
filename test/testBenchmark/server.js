const http = require('http');
const { defaultSyncThread } = require('../../src').threadPool;
const path = require('path');

http.createServer(async function(req, res) {
    const worker = await defaultSyncThread.submit(path.resolve(__dirname, 'cal.js'));
    worker.on('done', function(ret) {
        res.end('ok');
    });
    worker.on('error', function() {
        console.log(arguments);
    });
}).listen(9297);

