const { Transform } = require('stream')

const pdfValidator = () => {
    let prefix = Buffer.alloc(0)
    let typeChecked = false

    return new Transform({
        transform(chunk, encoding, callback){
            if(!typeChecked){
                const bytesNeeded = 4 - prefix.length

                prefix = Buffer.concat([
                    prefix,
                    chunk.subarray(0, bytesNeeded)
                ])

                if(prefix.length >= 4) {

                    const signature = prefix.subarray(0, 4).toString()

                    if(signature !== "%PDF"){

                        const error = new Error("Invalid PDF File")
                        error.statusCode = 400
                        return callback(
                            error
                        )
                    }

                    typeChecked = true
                }
            }

            callback(null, chunk)
        },

        flush(callback){
            if(!typeChecked){
                const error = new Error("Unable to Verify PDF File")
                error.statusCode = 400
                return callback(
                    error
                )
            }
            callback()
        }
    })
}
    module.exports = pdfValidator