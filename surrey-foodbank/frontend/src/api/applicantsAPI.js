const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

export async function getApplicants() {
  const res = await fetch(`${BASE_URL}/api/applicants`)
  if (!res.ok) throw new Error(await res.text())
  const result = await res.json()
  return Array.isArray(result) ? result : (result.data ?? [])
}

export async function getApplicant(id) {
  const res = await fetch(`${BASE_URL}/api/applicants/${id}`)
  if (!res.ok) throw new Error(await res.text())
  const result = await res.json()
  return result.data ?? null
}

export async function updateApplicant(id, updates) {
  const res = await fetch(`${BASE_URL}/api/applicants/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getHouseholdMembers(responseId) {
  const res = await fetch(`${BASE_URL}/api/applicants/${responseId}/household-members`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function createApplicant(data) {
  const res = await fetch(`${BASE_URL}/api/applicants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  const result = await res.json()
  return result.data ?? null
}

export async function getApplicantByEmail(email) {
  const res = await fetch(`${BASE_URL}/api/applicants/by-email/${encodeURIComponent(email)}`)
  if (!res.ok) throw new Error(await res.text())
  const result = await res.json()
  return result.data ?? null
}

/**
 * Replace all household members for a given responseId.
 * members: Array<{ firstName, lastName, ageGroup }>
 */
export async function saveHouseholdMembers(responseId, members) {
  const res = await fetch(
    `${BASE_URL}/api/applicants/${responseId}/household-members`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members }),
    }
  )
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}