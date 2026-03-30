const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

export async function getApplicants() {
  const res = await fetch(`${BASE_URL}/api/applicants`)
  if (!res.ok) throw new Error(await res.text())
  const result = await res.json()
  return Array.isArray(result) ? result : (result.data ?? [])
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

