import express from "express"
import { getApplicants, updateApplicant } from "../api/applicants.js"

const router = express.Router()

// GET /api/applicants
router.get("/", async (req, res) => {
  try {
    const data = await getApplicants()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/applicants/:id
router.patch("/:id", async (req, res) => {
  try {
    const data = await updateApplicant(req.params.id, req.body)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router