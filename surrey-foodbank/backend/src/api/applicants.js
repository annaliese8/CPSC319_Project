import { getSupabaseServiceClient } from "../lib/supabase.js"
const supabase = getSupabaseServiceClient()
import EmailClient from "./emailclient.js";
const emailClient = new EmailClient();

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
  console.log("CREATING APPOINTMENT", appointmentData)
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
  if (error) throw error
  try {
    await emailClient.sendConfirmation("Joe", "insertEmailHere", appointmentData.appointment_date.concat(" at ").concat(appointmentData.appointment_time));
  } catch (e) {
    console.log(e);
  }
  return data
}

export async function updateAppointment(appointmentId, updates) {
  console.log("UPDATING APPOINTMENT", appointmentId, updates);
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
  // Fire-and-forget — do not await so the response is not delayed
  emailClient.sendCancellation("Joe", "insertEmailHere", "today").catch(() => {})
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

const DEFAULT_SCHEDULE_CONFIG = [
  { day_of_week: 'Monday',    open_time: '09:00', close_time: '13:00', is_active: true  },
  { day_of_week: 'Tuesday',   open_time: '09:00', close_time: '13:00', is_active: true  },
  { day_of_week: 'Wednesday', open_time: '09:00', close_time: '13:00', is_active: true  },
  { day_of_week: 'Thursday',  open_time: '09:00', close_time: '13:00', is_active: true  },
  { day_of_week: 'Friday',    open_time: '09:00', close_time: '13:00', is_active: true  },
  { day_of_week: 'Saturday',  open_time: '09:00', close_time: '13:00', is_active: false },
  { day_of_week: 'Sunday',    open_time: '09:00', close_time: '13:00', is_active: false },
]

export async function getScheduleConfig() {
  const { data, error } = await supabase
    .from('schedule_config')
    .select('*')
    .order('id', { ascending: true })
  if (error) return DEFAULT_SCHEDULE_CONFIG
  return data && data.length > 0 ? data : DEFAULT_SCHEDULE_CONFIG
}

export async function updateScheduleConfig(configs) {
  const { data, error } = await supabase
    .from('schedule_config')
    .upsert(configs, { onConflict: 'day_of_week' })
    .select()
  if (error) throw error
  return data
}