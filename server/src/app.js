import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import problemRouter from './routes/problem.routes.js'
import duelRouter from './routes/duel.routes.js'
import submissionRouter from './routes/submission.routes.js'
import aiProblemRouter from './routes/aiProblem.routes.js'

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/problems", problemRouter)
app.use("/api/v1/duels", duelRouter)
app.use("/api/v1/submissions", submissionRouter)
app.use("/api/v1/ai-problems", aiProblemRouter)

export { app }