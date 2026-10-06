const Document = require("../models/Document")
const Project = require("../models/Project")
const fs = require('fs')
const mongoose = require('mongoose')
const fileUpload = require('../services/uploadServices')

const uploadDocument = async (req, res) => {
    const projectId = req.params.projectId

    try{
        const validId = mongoose.Types.ObjectId.isValid(projectId)

        if(!validId){
            return res.status(400).json({
                message: "Project Id is invalid"
            })
        }

        const project = await Project.findOne({
            _id: projectId,
            userId: req.user.userId
        })

        if(!project)
            return res.status(404).json({
        message: "Doesn't exist or does not belong to user"
        })

        const failUpload = async (err)=>{

            console.log(err)

            await cleanupFile()

            const statusCode = err.statusCode || 500

            return res.status(statusCode).json({
                message: `Upload Failed: ${err.message}`
            })
        }

        const {
                documentName, 
                filepath, 
                multipleFiles
            } = await fileUpload(req)

        const cleanupFile = async ()=>{
            if(!filepath) return

            try{
                await fs.promises.unlink(filepath)
            }catch(err){
                console.log(`Failed to delete filepath: ${err.message}`)
            }
        }

        if(!documentName){
            await cleanupFile()

            return res.status(400).json({
                message: "Document's name is required"
            })
        }

        if(multipleFiles){
            await cleanupFile()

            return res.status(400).json({
                message: "One file allowed per request"
            })
        }

        try{
            const document = await Document.create({
                name: documentName,
                filepath,
                projectId,
                userId: req.user.userId,
                status: "UPLOADED"
            })

            res.status(201).json({
                document
            })

        }catch(err){
            await failUpload(err)
        }
        
    }catch(err){
        const statusCode = err.statusCode || 500
        res.status(statusCode).json({
            message: err.message
        })
    }

}

module.exports = { uploadDocument }