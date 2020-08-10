const http = require('http');
const { defaultSyncThread } = require('../../src').threadPool;
const path = require('path');

http.createServer(function(req, res) {
    const worker = defaultSyncThread.submit(path.resolve(__dirname, 'cal.js'));
    worker.on('message', function(ret) {
        res.end('ok');
    });
    worker.on('error', function() {
        console.log(arguments);
    });
}).listen(9297);

