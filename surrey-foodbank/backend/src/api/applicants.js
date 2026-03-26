import { supabase } from '../lib/supabaseClient.js'

// ── Applicants ────────────────────────────────────────────────────────────────

export async function getApplicants() {
  const { data, error } = await supabase
    .from('registrationformresponse')
    .select('*')
  if (error) throw error
  return data
}

export async function updateApplicant(id, updates) {
  const { data, error } = await supabase
    .from('registrationformresponse')
    .update(updates)
    .eq('response_id', id)
    .select()
  if (error) throw error
  return data
}

// ── Appointments ──────────────────────────────────────────────────────────────

export async function getAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      registrationformresponse (
        first_name,
        last_name,
        email_address,
        phone
      )
    `)
  if (error) throw error
  return data
}

export async function getAppointmentByResponseId(responseId) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('response_id', responseId)
    .single()
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
  return data ?? null
}

export async function updateAppointment(appointmentId, updates) {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('appointment_id', appointmentId)
    .select()
  if (error) throw error
  return data
}

export async function deleteAppointment(appointmentId) {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('appointment_id', appointmentId)
  if (error) throw error
}