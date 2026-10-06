const mongoose = require("mongoose")

const documentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    filepath: {
        type: String,
        required: true
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    status: {
        type: String,
        enum: [
            "UPLOADING",
            "UPLOADED",
            "PROCESSING",
            "COMPLETED",
            "FAILED"
        ],
        default: "UPLOADING"
    }
},

{
    timestampms: true
}

)

module.exports = mongoose.model('Document', documentSchema)