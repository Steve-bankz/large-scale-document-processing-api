const Busboy = require("busboy")
const path = require("path")
const fs = require('fs')
const { pipeline } = require('stream/promises')
const createPdfValidator = require('../streams/pdfValidator')
const createSizeLimiter = require('../streams/sizeLimiter')
const storage = require('../storage/fileStorage')
const fileValidator = require('../validators/fileValidator')

const handleUpload = async (req) => {
    let filepath
    let documentName;
    let multipleFiles = false
    let fileReceived = false
    let busboyFinished = false
    let fileWritten = false
    let settled = false
    let pipelineRunning = false
    let abortProcessing = false
    let originalError
    const uploadController = new AbortController()

    const settleReject = (error)=>{
        if(settled) return

        settled = true

        reject(error)
    }

    const settleResolve = (result)=>{
        if(settled) return

        settled = true

        resolve(result)
    }

    const abortUpload = async ()=>{
        if(settled) return

        if(abortProcessing) return

        abortProcessing = true

        const clientAbortErr = new Error('Client aborted the request')
        clientAbortErr.statusCode = 499

        originalError = originalError || clientAbortErr

        if(pipelineRunning){
            abortUploadController()
            return
        }

        await cleanupFile()
        settleReject(originalError)
    }

    const abortUploadController = () =>{
        if(!uploadController.signal.aborted){
            uploadController.abort()
        }
    } 

    const cleanupFile = async ()=>{
        if(!filepath) return

        try{
            await fs.promises.unlink(filepath)
        }catch(cleanupErr){
            console.log(`Failed to delete filepath: ${cleanupErr.message}`)
        }
    }

    const pdfValidator = createPdfValidator()
    
    const sizeLimiter = createSizeLimiter()

    const busboy = Busboy({headers: req.headers})

    return new Promise ((resolve, reject)=>{

        const checkUploadComplete = ()=>{
            if(!busboyFinished) {
                return
            }

            if(!fileReceived){

                const err = new Error("No file found")
                err.statusCode = 400
                settleReject(err)
                return  
                
            }

            if(!fileWritten){
                return
            }

            const result = {
                documentName,
                multipleFiles,
                filepath,
            }

            settleResolve(result)
        }

        busboy.on('field', (fieldname, value) => {
            if(fieldname === "name")
                documentName = value.trim()
        })

        busboy.on('file', async (fieldname, file, info)=>{
            if(abortProcessing){
                file.resume()
                return
            }

            if(fileReceived){

                if(multipleFiles){
                    file.resume()
                    return
                }

                multipleFiles = true

                originalError = new Error("One file per request") 
                originalError.statusCode = 400

                if(pipelineRunning){
                    abortUpload()
                    return
                }

                await cleanupFile()
                settleReject(originalError)
                return
                
            }

            fileReceived = true

            const extension = path.extname(info.filename).toLowerCase()
            
            const validationError = fileValidator(info, extension)

            if(validationError){
                file.resume()
                settleReject(validationError)
                return
            }

            const { filepath: newFilepath, writeStream } = storage(extension)

            filepath = newFilepath

            ;(async ()=>{
                try{
                    console.log("🔥 PIPELINE STARTING")

                    pipelineRunning = true

                    await pipeline(
                        file,
                        pdfValidator,
                        sizeLimiter, 
                        writeStream, {
                        signal: uploadController.signal
                    })

                    if(settled) return

                    if(originalError){
                        await cleanupFile()
                        settleReject(originalError)
                        return
                    }

                    fileWritten = true

                    checkUploadComplete()
                
                }catch(err){
                    const theError = originalError || err
                    console.log(theError)
                    await cleanupFile()
                    settleReject(theError)
                }finally{
                    pipelineRunning = false
                }   
            })()
        })

        busboy.on('finish', ()=>{
            busboyFinished = true

            checkUploadComplete()
        })

        busboy.on('error', async (err)=>{
            originalError = err

            if(pipelineRunning){
                abortUpload()
                return 
            }

            await cleanupFile()
            settleReject(originalError)
        })

        req.on('aborted', abortUpload)

        req.socket.on("error", abortUpload)
        

        req.pipe(busboy)

    })

}


module.exports = handleUpload
