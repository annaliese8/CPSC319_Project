import { supabase } from '../lib/supabaseClient'

// GET all
export async function getPosts() {
  const { data, error } = await supabase.from('posts').select('*')
  if (error) throw error
  return data
}

// GET one
export async function getPost(id) {
  const { data, error } = await supabase.from('posts').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

// POST
export async function createPost(post) {
  const { data, error } = await supabase.from('posts').insert(post).select()
  if (error) throw error
  return data
}

// PUT/PATCH
export async function updatePost(id, updates) {
  const { data, error } = await supabase.from('posts').update(updates).eq('id', id).select()
  if (error) throw error
  return data
}

// DELETE
export async function deletePost(id) {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}
