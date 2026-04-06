const BASE_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

export async function getScheduleConfig() {
  try {
    const res = await fetch(`${BASE_URL}/api/appointments/schedule-config`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function updateScheduleConfig(configs) {
  const res = await fetch(`${BASE_URL}/api/appointments/schedule-config`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ configs }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
