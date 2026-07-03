require("dotenv").config({ path: "./Backend/.env" })
const app = require("./Backend/src/app")
const connectToDB = require("./Backend/src/config/database")

connectToDB()
app.listen(3000, () => {
    console.log("server is running on port 3000")
})
