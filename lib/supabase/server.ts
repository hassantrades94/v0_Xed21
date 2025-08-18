import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cache } from "react"

export const createClient = cache(() => {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
})

export const isSupabaseConfigured = true
