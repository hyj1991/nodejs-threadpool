
module.exports = async function() {
    return await new Promise((resolve) => {
        setTimeout(() => {
            resolve({type: 'async'})
            console.log(1)
        },3000)
    })
}