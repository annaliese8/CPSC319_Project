import "dotenv/config"
import express from "express"
import cors from "cors"
import applicantsRouter from "./routes/applicantsRoute.js"
import appointmentsRouter from "./routes/appointmentsRoute.js"
import applicantRouter from "./routes/applicantRoute.js"
import staffRouter from "./routes/staffRoute.js"

const PORT = Number(process.env.PORT) || 3000

const defaultAllowedOrigins = [
	"https://annaliese8.github.io",
]

const configuredOrigins = String(process.env.CORS_ORIGIN || "")
	.split(",")
	.map((value) => value.trim().replace(/\/$/, ""))
	.filter(Boolean)

const allowedOrigins = new Set([...defaultAllowedOrigins, ...configuredOrigins])


export const app = express()
app.use(
	cors({
		origin(origin, callback) {
			if (!origin) return callback(null, true)
			const normalizedOrigin = String(origin).replace(/\/$/, "")
			if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)
			if (allowedOrigins.has(normalizedOrigin)) return callback(null, true)
			return callback(new Error("Not allowed by CORS"))
		},
	}),
)
app.use(express.json())

app.use("/api/applicants", applicantsRouter)
app.use("/api/applicant", applicantRouter)

app.use("/api/appointments", appointmentsRouter) // → appointmentsRoute.js
app.use("/api/staff", staffRouter)
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))