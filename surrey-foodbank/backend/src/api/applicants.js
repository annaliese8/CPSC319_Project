import { getSupabaseServiceClient } from "../lib/supabase.js"
const supabase = getSupabaseServiceClient()
import EmailClient from "./emailclient.js";
const emailClient = new EmailClient();
import {parse, format, addSeconds} from 'date-fns';

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

export async function getFullAppointmentByResponseId(responseId) {
  const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('response_id', responseId)
      .not('appointment_status', 'eq', 'cancelled')
      .not('appointment_status', 'eq', 'blocked')
      .order('appointment_date', { ascending: false })
      .select(`
      *,
      registrationformresponse (
        first_name,
        last_name,
        email_address,
        phone
      )
    `)
      .limit(1)
  if (error) throw error
  return data?.[0] ?? null
}

export async function getAppointmentByAppointmentId(appointmentId) {
  const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_id', appointmentId)
      .not('appointment_status', 'eq', 'blocked')
      .not('appointment_status', 'eq', 'cancelled')
      .order('appointment_date', { ascending: false })
      .select(`
      *,
      registrationformresponse (
        first_name,
        last_name,
        email_address,
        phone
      )
    `)
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
  try {
    const info = await getFullAppointmentByResponseId(appointmentData.response_id);

    await sendConfirmationEmail(info.registrationformresponse.first_name,
                                info.registrationformresponse.last_name,
                                info.registrationformresponse.email_address,
                                appointmentData.appointment_date,
                                appointmentData.appointment_time,
                                appointmentData.duration);
  } catch (e) {
    console.log(e);
  }
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
  const info = await getAppointmentByAppointmentId(appointmentId);

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('appointment_id', appointmentId)
  if (error) throw error
  try {
    await sendCancellationEmail(info.registrationformresponse.first_name,
                                info.registrationformresponse.last_name,
                                info.registrationformresponse.email_address, info.appointment_date, info.appointment_time);
  }catch (e) {
    console.log(e);
  }
}



export async function sendCancellationEmail(firstName, lastName, email, date, startTime) {
  await emailClient.sendCancellation(firstName.concat(" ", lastName), email,
                                     dateToPlainText(date).concat(" at ", timeToPlainText(startTime)));
}

export async function sendConfirmationEmail(firstName, lastName, email, date, startTime, duration) {
  const endTime = getFinalTime(startTime, duration)

  await emailClient.sendConfirmation(firstName.concat(" ", lastName),
      email,
      dateToPlainText(date).concat(" from ", timeToPlainText(startTime), " to ", timeToPlainText(endTime)));
}


// ClaudeAI was used to help with the following time and date functions
function dateToPlainText(date) {
  const newDate = parse(date, 'yyyy-MM-dd', new Date());
  return format(newDate, 'EEEE, MMMM d');
}

function timeToPlainText(time) {
  const newTime = parse(time, 'HH:mm:ss', new Date());
  return format(newTime, 'h:mma').toLowerCase();
}

function getFinalTime(startTime, duration) {
  const start = parse(startTime, 'HH:mm:ss', new Date());
  const secondsToAdd = hmsToSeconds(duration);
  const finalTime = addSeconds(start, secondsToAdd);
  return format(finalTime, 'HH:mm:ss');
}

function hmsToSeconds(hms) {
  const [h, m, s] = hms.split(':').map(Number);
  return h*3600 + m*60 + s;
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