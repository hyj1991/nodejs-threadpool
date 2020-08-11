
module.exports = async function() {ss
    return await new Promise((resolve) => {
        setTimeout(() => {
            resolve({type: 'async'})
            console.log(1, ...arguments)
        },3000)
    })
}