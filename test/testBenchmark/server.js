const http = require('http');
const { defaultSyncThread } = require('../../threadPool');
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

setTimeout(() => {
    const result = [];
    
    let i = 0;
    let resCount = 0;
    const reqCount = 10;
    while(i++ < reqCount) {
        const key = Math.random();
    console.time(key)
        http.request({
            host: '127.0.0.1',
            port: 9297
        }, function(res) {
            res.on('data', function() {
            // nothing to do，for emit end event
            });
            res.on('end', function() {
                
        console.timeEnd(key);
                resCount++;
                if (resCount === reqCount) {
                    process.exit(0);
                }
            });
        }).end();
    }
},1000)