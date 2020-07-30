module.exports = function() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(2)
            resolve();
        },1000)
    });
}