const { Transform } = require('stream')

const createSizeLimiter = () => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    let bytesReceived = 0

    return new Transform({
        transform(chunk, encoding, callback){
            bytesReceived += chunk.length

            if(bytesReceived > MAX_FILE_SIZE){
                const error = new Error('File size exceeds 10mb limit')
                error.statusCode = 413
                callback(error)
                return
            }

            callback(null, chunk)
        }
    })
}

module.exports = createSizeLimiter