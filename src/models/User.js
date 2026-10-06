const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true,
        select: false
    }

}) 

userSchema.pre('save', async function (){
    if(!this.isModified('password')) return
    this.password = await bcrypt.hash(this.password, 10)
})

module.exports = mongoose.model('User', userSchema)
