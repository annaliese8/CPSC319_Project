import "dotenv/config"
import express from "express"
import cors from "cors"
import applicantsRouter from "./routes/applicantsRoute.js"
import applicantRouter from "./routes/applicantRoute.js"

const app = express()
app.use(
	cors({
		origin(origin, callback) {
			if (!origin) return callback(null, true)
			if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)
			return callback(new Error("Not allowed by CORS"))
		},
	}),
)
app.use(express.json())
app.use("/api/applicants", applicantsRouter)
app.use("/api/applicant", applicantRouter)

app.listen(3000, () => console.log("Backend running on port 3000"))
