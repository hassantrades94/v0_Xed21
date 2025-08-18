const mockSupabaseClient = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
  },
  from: (table: string) => ({
    select: () => ({
      data: [],
      error: null,
      eq: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: null }),
    }),
    insert: () => ({
      data: null,
      error: null,
      eq: () => ({ data: null, error: null }),
    }),
    update: () => ({
      data: null,
      error: null,
      eq: () => ({ data: null, error: null }),
    }),
    delete: () => ({
      data: null,
      error: null,
      eq: () => ({ data: null, error: null }),
    }),
  }),
}

export function createClient() {
  return mockSupabaseClient
}

export const isSupabaseConfigured = true
