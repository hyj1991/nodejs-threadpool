module.exports = new Promise((resolve) => {
    setTimeout(() => {
        console.log(1)
        resolve({type: 'sync'})
    },3000)
});