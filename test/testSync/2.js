module.exports = new Promise((resolve) => {
    setTimeout(() => {
        console.log(2)
        resolve();
    },1000)
});