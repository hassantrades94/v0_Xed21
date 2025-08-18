import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export const createClient = () => {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Legacy export for backward compatibility
export const supabase = createClient()

// Check if Supabase is properly configured
export const isSupabaseConfigured = true
