import express from "express"
import { getSupabaseServiceClient } from "../lib/supabase.js"
import {
  APPLICANT_TABLE,
  APPOINTMENT_TABLE,
  HOUSEHOLD_TABLE,
  HOUSEHOLD_RESPONSE_ID_COLUMN,
  HOUSEHOLD_ID_COLUMN,
  HOUSEHOLD_FIRST_NAME_COLUMN,
  HOUSEHOLD_LAST_NAME_COLUMN,
  HOUSEHOLD_CATEGORY_COLUMN,
  APPOINTMENT_RESPONSE_ID_COLUMN,
  APPOINTMENT_STATUS_COLUMN,
  APPOINTMENT_DATE_COLUMN,
} from "../lib/supabase.js"

const router = express.Router()

router.get("/applicants", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
      .from(APPLICANT_TABLE)
      .select("*")
    if (error) throw error
    return res.status(200).json({ ok: true, data })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to fetch applicants." })
  }
})

router.patch("/applicants/:id", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
      .from(APPLICANT_TABLE)
      .update(req.body)
      .eq("response_id", req.params.id)
      .select()
    if (error) throw error
    return res.status(200).json({ ok: true, data })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to update applicant." })
  }
})

router.get("/applicants/:id/household-members", async (req, res) => {
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

router.get("/appointments", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
      .from(APPOINTMENT_TABLE)
      .select(`*, ${APPLICANT_TABLE} ( first_name, last_name, email_address, phone )`)
    if (error) throw error
    return res.status(200).json({ ok: true, data })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to fetch appointments." })
  }
})

router.get("/appointments/by-applicant/:id", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
      .from(APPOINTMENT_TABLE)
      .select("*")
      .eq(APPOINTMENT_RESPONSE_ID_COLUMN, req.params.id)
      .not(APPOINTMENT_STATUS_COLUMN, "eq", "cancelled")
      .not(APPOINTMENT_STATUS_COLUMN, "eq", "blocked")
      .order(APPOINTMENT_DATE_COLUMN, { ascending: false })
      .limit(1)
    if (error) throw error
    return res.status(200).json({ ok: true, data: data?.[0] ?? null })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to fetch appointment." })
  }
})

router.patch("/appointments/:id", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase
      .from(APPOINTMENT_TABLE)
      .update(req.body)
      .eq("appointment_id", req.params.id)
      .select()
    if (error) throw error
    return res.status(200).json({ ok: true, data })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to update appointment." })
  }
})

router.delete("/appointments/:id", async (req, res) => {
  try {
    const supabase = getSupabaseServiceClient()
    const { error } = await supabase
      .from(APPOINTMENT_TABLE)
      .delete()
      .eq("appointment_id", req.params.id)
    if (error) throw error
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to delete appointment." })
  }
})

export default router