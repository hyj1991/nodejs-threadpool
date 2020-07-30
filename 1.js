module.exports = function() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(1)
            resolve()
        },3000)
    });
}