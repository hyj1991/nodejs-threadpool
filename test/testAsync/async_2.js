
module.exports = async function() {
    return await new Promise((resolve) => {
        setTimeout(() => {
            resolve({type: 'async'})
            console.log(2)
        },1000)
    })
}