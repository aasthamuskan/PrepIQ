const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")


async function authUser(req, res, next) {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({
                message: "Token not provided."
            })
        }

        // Verify JWT first (fast, no DB call)
        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            return res.status(401).json({
                message: "Invalid token."
            })
        }

        // Check blacklist
        try {
            const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token })
            if (isTokenBlacklisted) {
                return res.status(401).json({
                    message: "Token is invalid."
                })
            }
        } catch (dbErr) {
            // If DB check fails, still allow if JWT is valid
            console.error("Blacklist check failed (DB issue):", dbErr.message)
        }

        req.user = decoded
        next()

    } catch (err) {
        console.error("Auth middleware error:", err)
        return res.status(401).json({ message: "Authentication failed." })
    }
}


module.exports = { authUser }