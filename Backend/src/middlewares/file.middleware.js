const multer = require("multer")


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB — matches frontend display
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true) // accept
        } else {
            cb(new Error("Only PDF files are allowed."), false) // reject
        }
    }
})


module.exports = upload