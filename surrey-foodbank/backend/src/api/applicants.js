import { supabase } from '../lib/supabaseClient'

// GET all applicants
export async function getApplicants() {
  const { data, error } = await supabase
    .from('registrationformresponse')
    .select('*')
    .order('created_at', { ascending: false })
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
