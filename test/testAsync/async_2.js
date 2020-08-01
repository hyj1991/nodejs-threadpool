module.exports = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve()
        console.log(2)
    },1000)
})