const Project = require("../models/Project")

const createProject = async (req, res) => {
    try{
    const projectName = req.body.name
    const userId = req.user.userId

    if(!projectName){
        return res.status(400).json({
            message: " Name is required"
        })
    }

    const project = new Project({
        name: projectName,
        userId: userId
    })

    await project.save()
    res.status(201).json({project})
}catch(err){
    res.status(500).json({message: err.message})
}

}

module.exports = { createProject }
