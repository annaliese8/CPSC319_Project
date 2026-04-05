import { getSupabaseServiceClient } from "../lib/supabase.js"
const supabase = getSupabaseServiceClient()
import EmailClient from "./emailclient.js";
import {response} from "express";
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
  console.log("CREATING APPOINTMENT", appointmentData)
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
  if (error) throw error
  try {
    const info = await getAppointmentByResponseId(appointmentData.response_id);

    await emailClient.sendConfirmation(info.registrationformresponse.first_name.concat(" ", info.registrationformresponse.last_name),
                                       info.registrationformresponse.email_address,
                                       appointmentData.appointment_date.concat(" at ").concat(appointmentData.appointment_time));
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
  console.log(appointmentId, "DELETING APPOINTMENT")
  const info = await getAppointmentByAppointmentId(appointmentId);
  console.log("HERE IT IS!!!", info);

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('appointment_id', appointmentId)
  if (error) throw error
  try {
    await emailClient.sendCancellation(info.registrationformresponse.first_name.concat(" ", info.registrationformresponse.last_name),
                                       info.registrationformresponse.email_address,
                                       info.appointment_date.concat(" at ").concat(info.appointment_time));
  }catch (e) {
    console.log(e);
  }
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