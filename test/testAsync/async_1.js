
module.exports = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve({type: 'async'})
        console.log(1)
    },3000)
})