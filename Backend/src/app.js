const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, curl)
        if (!origin) return callback(null, true)

        // Allow all localhost ports in development
        if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)

        // Allow the specific deployed frontend URL (set in env)
        const allowedOrigin = process.env.ALLOWED_ORIGIN
        if (allowedOrigin && origin === allowedOrigin) return callback(null, true)

        // Allow any vercel.app domain (for preview deployments too)
        if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true)

        callback(new Error("Not allowed by CORS"))
    },
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

/* Global error handler — catches unhandled errors in all routes */
app.use((err, req, res, next) => {
    console.error("Error:", err.message)
    res.status(err.status || 500).json({
        message: err.message || "Internal server error"
    })
})

module.exports = app