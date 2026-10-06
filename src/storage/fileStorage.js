const { v4: uuidv4 } = require("uuid")
const path = require("path")
const fs = require('fs')

const createFileStorage = (extension) => {
        const uniqueName = `${uuidv4()}${extension}`

        const filepath = path.join('uploads', uniqueName)

        const writeStream = fs.createWriteStream(filepath)

        return {
            filepath,
            writeStream
        }
}

module.exports = createFileStorage