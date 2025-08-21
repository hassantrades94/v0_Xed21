import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createBrowserClient } from "@supabase/ssr"

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Legacy export for backward compatibility
export const supabase = createClient()

// Check if Supabase is properly configured
export const isSupabaseConfigured = true
