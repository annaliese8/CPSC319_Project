import express from "express"
import {
  getAppointments,
  getAppointmentByResponseId,
  updateAppointment,
  deleteAppointment,
} from "../api/applicants.js"

const router = express.Router()

// GET /api/appointments
router.get("/", async (req, res) => {
  try {
    const data = await getAppointments()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/appointments/by-response/:responseId
router.get("/by-response/:responseId", async (req, res) => {
  try {
    const data = await getAppointmentByResponseId(req.params.responseId)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/appointments/:id
router.patch("/:id", async (req, res) => {
  try {
    const data = await updateAppointment(req.params.id, req.body)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/appointments/:id
router.delete("/:id", async (req, res) => {
  try {
    await deleteAppointment(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
