const BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function getAppointments() {
  const res = await fetch(`${BASE_URL}/api/appointments`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAppointmentsByDateRange(startDate, endDate) {
  const res = await fetch(
    `${BASE_URL}/api/appointments?start=${startDate}&end=${endDate}`
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAppointmentByResponseId(responseId) {
  const res = await fetch(
    `${BASE_URL}/api/appointments/by-response/${responseId}`
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createAppointment(appointmentData) {
  const res = await fetch(`${BASE_URL}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(appointmentData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateAppointment(appointmentId, updates) {
  const res = await fetch(`${BASE_URL}/api/appointments/${appointmentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteAppointment(appointmentId) {
  const res = await fetch(`${BASE_URL}/api/appointments/${appointmentId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Insert multiple blocked slots in one call.
 * Each item: { appointment_date, appointment_time, duration }
 */
export async function createBlockedSlots(slots) {
  const res = await fetch(`${BASE_URL}/api/appointments/blocked`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slots }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Delete blocked slots by their appointment_ids.
 */
export async function deleteBlockedSlots(appointmentIds) {
  const res = await fetch(`${BASE_URL}/api/appointments/blocked`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appointmentIds }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}