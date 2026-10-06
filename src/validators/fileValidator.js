
const fileValidator = (info, extension) => {
    const allowedExtension = [".pdf"]
        const allowedMimeTypes = ["application/pdf"]

        if(!allowedExtension.includes(extension)){
            const error = new Error('Unsupported File Type')
            error.statusCode = 400
            return error
        }

        if(!allowedMimeTypes.includes(info.mimeType)){
            const error = new Error('Unsupported MIme Type')
            error.statusCode = 400
            return error
        }

        return null
}

module.exports = fileValidator