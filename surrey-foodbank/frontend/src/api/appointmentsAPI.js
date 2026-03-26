const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

export async function getAppointments() {
  const res = await fetch(`${BASE_URL}/api/appointments`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getAppointmentByResponseId(responseId) {
  const res = await fetch(`${BASE_URL}/api/appointments/by-response/${responseId}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateAppointment(appointmentId, updates) {
  const res = await fetch(`${BASE_URL}/api/appointments/${appointmentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteAppointment(appointmentId) {
  const res = await fetch(`${BASE_URL}/api/appointments/${appointmentId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
