import { getSupabaseAnonClient } from "../lib/supabase.js"

const supabase = getSupabaseAnonClient()

// GET all applicants
export async function getApplicants() {
  const { data, error } = await supabase
    .from('registrationformresponse')
    .select('*')
  if (error) throw error
  return data
}

// PATCH — update a single applicant by response_id
export async function updateApplicant(id, updates) {
  const { data, error } = await supabase
    .from('registrationformresponse')
    .update(updates)
    .eq('response_id', id)  // use response_id, not id
    .select()
  if (error) throw error
  return data
}