import express from "express"
import {
  getAppointments,
  getAppointmentsByDateRange,
  getAppointmentByResponseId,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  createBlockedSlots,
  deleteBlockedSlots,
} from "../api/applicants.js"

const router = express.Router()

// GET /api/appointments
// Optional query params: ?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/", async (req, res) => {
  try {
    const { start, end } = req.query
    const data = (start && end)
      ? await getAppointmentsByDateRange(start, end)
      : await getAppointments()
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

// POST /api/appointments
router.post("/", async (req, res) => {
  try {
    const data = await createAppointment(req.body)
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/appointments/blocked
router.post("/blocked", async (req, res) => {
  try {
    const { slots } = req.body
    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ error: "slots must be a non-empty array" })
    }
    const data = await createBlockedSlots(slots)
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/appointments/blocked
router.delete("/blocked", async (req, res) => {
  try {
    const { appointmentIds } = req.body
    if (!Array.isArray(appointmentIds) || appointmentIds.length === 0) {
      return res.status(400).json({ error: "appointmentIds must be a non-empty array" })
    }
    await deleteBlockedSlots(appointmentIds)
    res.json({ success: true })
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