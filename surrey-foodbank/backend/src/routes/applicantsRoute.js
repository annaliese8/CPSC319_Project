import express from "express"
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

// POST /api/applicants — create a new registration entry valid
router.post("/", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
      .from("registrationformresponse")
      .insert(req.body)
      .select()
    if (error) throw error
    return res.status(201).json({ ok: true, data: data?.[0] ?? null })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to create applicant." })
  }
})

// GET /api/applicants
router.get("/", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
      .from("registrationformresponse")
      .select(`
        *,
        appointments (
          appointment_id,
          appointment_date,
          appointment_time,
          appointment_status
        ),
        householdinformation (count)
      `)
    if (error) throw error
    return res.status(200).json({ ok: true, data })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to fetch applicants." })
  }
})

// GET /api/applicants/by-email/:email
router.get("/by-email/:email", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
      .from("registrationformresponse")
      .select("response_id, email_address")
      .eq("email_address", req.params.email)
      .maybeSingle()
    if (error) throw error
    return res.status(200).json({ ok: true, data })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to fetch applicant." })
  }
})

// GET /api/applicants/:id
router.get("/:id", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
      .from("registrationformresponse")
      .select("*")
      .eq("response_id", req.params.id)
      .maybeSingle()
    if (error) throw error
    return res.status(200).json({ ok: true, data })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to fetch applicant." })
  }
})

// PATCH /api/applicants/:id  — update personal info fields
router.patch("/:id", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
      .from("registrationformresponse")
      .update(req.body)
      .eq("response_id", req.params.id)
      .select()
    if (error) throw error
    return res.status(200).json({ ok: true, data })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to update applicant." })
  }
})

// GET /api/applicants/:id/household-members
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

// PUT /api/applicants/:id/household-members  — replace all members for a response
router.put("/:id/household-members", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const responseId = req.params.id
    const members = req.body.members // array of { firstName, lastName, ageGroup }

    if (!Array.isArray(members)) {
      return res.status(400).json({ error: "members must be an array" })
    }

    // Delete existing members for this response
    const { error: delError } = await supabase
      .from(HOUSEHOLD_TABLE)
      .delete()
      .eq(HOUSEHOLD_RESPONSE_ID_COLUMN, responseId)
    if (delError) throw delError

    // Insert new members (skip if empty array)
    if (members.length > 0) {
      const rows = members.map((m) => ({
        [HOUSEHOLD_RESPONSE_ID_COLUMN]: responseId,
        [HOUSEHOLD_FIRST_NAME_COLUMN]: m.firstName || "",
        [HOUSEHOLD_LAST_NAME_COLUMN]: m.lastName || "",
        [HOUSEHOLD_CATEGORY_COLUMN]: m.ageGroup || "",
      }))
      const { error: insError } = await supabase
        .from(HOUSEHOLD_TABLE)
        .insert(rows)
      if (insError) throw insError
    }

    // Return updated list
    const { data, error: fetchError } = await supabase
      .from(HOUSEHOLD_TABLE)
      .select("*")
      .eq(HOUSEHOLD_RESPONSE_ID_COLUMN, responseId)
      .order(HOUSEHOLD_ID_COLUMN, { ascending: true })
    if (fetchError) throw fetchError

    const result = (data ?? []).map((row) => ({
      id: String(row[HOUSEHOLD_ID_COLUMN]),
      firstName: row[HOUSEHOLD_FIRST_NAME_COLUMN],
      lastName: row[HOUSEHOLD_LAST_NAME_COLUMN],
      ageGroup: row[HOUSEHOLD_CATEGORY_COLUMN],
    }))
    return res.status(200).json({ ok: true, data: result })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to save household members." })
  }
})

export default router