
module.exports = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve({type: 'async event'});
        console.log(1)
    },3000)
})