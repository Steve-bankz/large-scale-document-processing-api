const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const { uploadDocument } = require("../controller/documentController")

const router = express.Router()

router.post('/:projectId/documents', authMiddleware, uploadDocument)

module.exports = router