const dotenv = require("dotenv")
dotenv.config()
const connect = require("./src/config/db")
const app = require("./src/app")

const PORT = process.env.PORT || 3000

const startServer = async ()=>{
    await connect()

    app.listen(PORT, '0.0.0.0', ()=>{
    console.log(`app listening on http://localhost:${PORT}`)
})
}


startServer()