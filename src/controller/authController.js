const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const register = async (req, res) => {
    try{
        const { name, email, password } = req.body

        if(!name || !email || !password){
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        const normalizedEmail = email.trim().toLowerCase()

        const userExist = await User.findOne({email: normalizedEmail})

        if (userExist) {
            return res.status(409).json({
                message: "User already exists"
            })
        }

        const user = new User({
            name,
            email: normalizedEmail,
            password
        })

        await user.save()

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}


const login = async (req, res) => {

    try{
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await User.findOne({email: normalizedEmail}).select("+password")

    if(!user){
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        {userId: user._id, email: user.email},
        process.env.JWT_SECRET,
        { expiresIn: '1h'}
    )

    res.status(200).json({
        message: "Login Successful",
        token
    })

}catch(err){
    res.status(400).json({
        message: err.message
    })
}
}

module.exports = { register, login }