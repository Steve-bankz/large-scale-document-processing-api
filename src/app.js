const express = require("express")
const projectRoutes = require("./routes/projectRoutes")
const authRoutes = require("./routes/authRoutes")
const documentRoutes = require("./routes/documentRoutes")

const app = express()

app.use(express.json())

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/projects', documentRoutes)
app.use('/api/v1/projects', projectRoutes)

module.exports = app