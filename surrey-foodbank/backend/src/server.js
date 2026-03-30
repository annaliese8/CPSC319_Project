import "dotenv/config"
import express from "express"
import cors from "cors"
import applicantsRouter from "./routes/applicantsRoute.js"
import appointmentsRouter from "./routes/appointmentsRoute.js"
import applicantRouter from "./routes/applicantRoute.js"
import staffRouter from "./routes/staffRoute.js"



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

app.use("/api/appointments", appointmentsRouter) // → appointmentsRoute.js
app.use("/api/staff", staffRouter)
app.listen(3000, () => console.log("Backend running on port 3000"))