const http = require('http');
const { MAX } = require('./constants');

http.createServer(function(req, res) {
    const key = Math.random();
    
    let ret = 0;
    let i = 0;
    while(i++ < MAX) {
        ret++;
        Buffer.from(String(Math.random())).toString('base64');
    }
    
    res.end('OK');
}).listen(9297);

setTimeout(() => {
    const result = [];
    let i = 0;
    let resCount = 0;
    const reqCount = 10;
    while(i++ < reqCount) {
        const key = String(i);
        const now = Date.now()
        console.log(now);
        http.request({
            host: '127.0.0.1',
            port: 9297
        }, function(res) {
            res.on('data', function() {
            // nothing to do，for emit end event
            });
            res.on('end', function() {
                resCount++;
                
    console.log('--',Date.now());
                if (resCount === reqCount) {
                    //console.table(result);
                    process.exit(0);
                }
            });
        }).end();
    }
},1000)