import { supabase } from '../lib/supabaseClient.js'

// GET all applicants
export async function getApplicants() {
  const { data, error } = await supabase
    .from('registrationformresponse')
    .select('*')
  if (error) throw error
  return data
}

// PATCH — update a single applicant by their id
export async function updateApplicant(id, updates) {
  const { data, error } = await supabase
    .from('registrationformresponse')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  return data
}
