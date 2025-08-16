const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"

// Mock Supabase client for v0 environment
const mockSupabaseClient = {
  auth: {
    signUp: async (credentials: any) => ({ data: { user: null }, error: null }),
    signInWithPassword: async (credentials: any) => ({
      data: { user: { id: "demo-user", email: credentials.email } },
      error: null,
    }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
  },
  from: (table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }),
}

export const createClient = () => {
  return mockSupabaseClient
}

// Legacy export for backward compatibility
export const supabase = createClient()

// Check if Supabase is properly configured
export const isSupabaseConfigured = true
