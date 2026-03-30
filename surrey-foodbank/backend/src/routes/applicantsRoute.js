import express from "express"
import { getApplicants, updateApplicant } from "../api/applicants.js"
import {
  getSupabaseServiceClient,
  HOUSEHOLD_TABLE,
  HOUSEHOLD_RESPONSE_ID_COLUMN,
  HOUSEHOLD_ID_COLUMN,
  HOUSEHOLD_FIRST_NAME_COLUMN,
  HOUSEHOLD_LAST_NAME_COLUMN,
  HOUSEHOLD_CATEGORY_COLUMN,
} from "../lib/supabase.js"

const router = express.Router()

// GET /api/applicants
router.get("/", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
  .from('registrationformresponse')
  .select(`
    *,
    appointments (
      appointment_id,
      appointment_date,
      appointment_time,
      appointment_status
    )
  `)
    if (error) throw error
    return res.status(200).json({ ok: true, data })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to fetch applicants." })
  }
})

// PATCH /api/applicants/:id
router.get("/:id", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
      .from('registrationformresponse')
      .select('*')
      .eq('response_id', req.params.id)
      .maybeSingle()
    if (error) throw error
    return res.status(200).json({ ok: true, data })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to fetch applicant." })
  }
})

router.get("/:id/household-members", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
      .from(HOUSEHOLD_TABLE)
      .select("*")
      .eq(HOUSEHOLD_RESPONSE_ID_COLUMN, req.params.id)
      .order(HOUSEHOLD_ID_COLUMN, { ascending: true })
    if (error) throw error
    const members = (data ?? []).map((row) => ({
      id: String(row[HOUSEHOLD_ID_COLUMN]),
      firstName: row[HOUSEHOLD_FIRST_NAME_COLUMN],
      lastName: row[HOUSEHOLD_LAST_NAME_COLUMN],
      ageGroup: row[HOUSEHOLD_CATEGORY_COLUMN],
    }))
    return res.status(200).json({ ok: true, data: members })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to fetch household members." })
  }
})

export default router