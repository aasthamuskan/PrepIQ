require("dotenv").config({ path: "./Backend/.env" })
const app = require("./Backend/src/app")
const connectToDB = require("./Backend/src/config/database")

const PORT = process.env.PORT || 3000

connectToDB()
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
