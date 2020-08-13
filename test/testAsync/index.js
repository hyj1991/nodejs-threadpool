const { defaultSyncThreadPool } = require('../../src').threadPool;
const path = require('path');
async function main() {
    try {
        const worker1 = await defaultSyncThreadPool.submit(path.resolve(__dirname, 'async_1.js'), {name: 1});
        worker1.on('done', function() {
            console.log(...arguments);
        });
        const worker2 = await defaultSyncThreadPool.submit(path.resolve(__dirname, 'async_2.js'), {name: 2});
        worker2.on('done', function() {
            console.log(...arguments);
        });
    } catch(e) {

    }
}

main();