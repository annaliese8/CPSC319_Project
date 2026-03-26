import express from "express"
import cors from "cors"
import applicantsRouter from "./routes/applicantsRoute.js"
import appointmentsRouter from "./routes/appointmentsRoute.js"

const app = express()
app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

app.use("/api/applicants", applicantsRouter)   // → applicantsRoute.js
app.use("/api/appointments", appointmentsRouter) // → appointmentsRoute.js

app.listen(3000, () => console.log("Backend running on port 3000"))