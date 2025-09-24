import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cache } from "react"

export const createClient = cache(() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found, using mock client')
    // Return a mock client that won't cause errors
    return {
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: [], error: null }),
        update: () => ({ data: [], error: null }),
        delete: () => ({ data: [], error: null }),
        single: () => ({ data: null, error: null }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
    } as any
  }
  
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
})

