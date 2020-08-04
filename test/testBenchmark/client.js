const http = require('http');
const { REQ_COUNT } = require('./constants');
let i = 0;
let resCount = 0;
while(i++ < REQ_COUNT) {
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
            if (resCount === REQ_COUNT) {
                process.exit(0);
            }
        });
    }).end();
}