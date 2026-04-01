import { getSupabaseServiceClient } from "../lib/supabase.js"
const supabase = getSupabaseServiceClient()

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

export async function getAppointmentsByDateRange(startDate, endDate) {
  // Lightweight JOIN: only fetch name + household_size for calendar slot display.
  // Email is still lazy-loaded when the info dialog opens.
  const { data, error } = await supabase
    .from('appointments')
    .select('*, registrationformresponse(first_name, last_name, householdinformation(count))')
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate)
  if (error) throw error
  return data
}

export async function getAppointmentByResponseId(responseId) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('response_id', responseId)
    .not('appointment_status', 'eq', 'cancelled')
    .not('appointment_status', 'eq', 'blocked')
    .order('appointment_date', { ascending: false })
    .limit(1)
  if (error) throw error
  return data?.[0] ?? null
}

export async function createAppointment(appointmentData) {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
  if (error) throw error
  return data
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

/**
 * Insert multiple blocked slots.
 * Each item: { appointment_date, appointment_time, duration }
 */
export async function createBlockedSlots(slots) {
  const rows = slots.map((s) => ({
    response_id: null,
    appointment_date: s.appointment_date,
    appointment_time: s.appointment_time,
    duration: s.duration ?? '00:15:00',
    appointment_status: 'blocked',
  }))
  const { data, error } = await supabase
    .from('appointments')
    .insert(rows)
    .select()
  if (error) throw error
  return data
}

/**
 * Delete blocked slots by their appointment_ids.
 */
export async function deleteBlockedSlots(appointmentIds) {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .in('appointment_id', appointmentIds)
  if (error) throw error
}