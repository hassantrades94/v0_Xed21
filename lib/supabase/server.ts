// Mock Supabase server client for Bolt environment
export const createClient = async () => {
  // Return a mock client that simulates Supabase functionality
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: () => Promise.resolve({ data: null, error: null }),
          limit: (count: number) => Promise.resolve({ data: [], error: null }),
          order: (column: string, options?: any) => ({
            limit: (count: number) => Promise.resolve({ data: [], error: null }),
          }),
        }),
        order: (column: string, options?: any) => ({
          limit: (count: number) => Promise.resolve({ data: [], error: null }),
        }),
        limit: (count: number) => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
      }),
      insert: (data: any) => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      }),
    }),
    auth: {
      getUser: () => Promise.resolve({ 
        data: { 
          user: {
            id: 'demo-user-123',
            email: 'geology.cupb16@gmail.com',
            user_metadata: { full_name: 'Mamun' }
          } 
        }, 
        error: null 
      }),
      signOut: () => Promise.resolve({ error: null }),
      signInWithPassword: (credentials: any) => Promise.resolve({ 
        data: { 
          user: {
            id: 'demo-user-123',
            email: credentials.email,
            user_metadata: { full_name: 'Demo User' }
          } 
        }, 
        error: null 
      }),
      signUp: (credentials: any) => Promise.resolve({ 
        data: { 
          user: {
            id: 'demo-user-123',
            email: credentials.email,
            user_metadata: { full_name: 'Demo User' }
          } 
        }, 
        error: null 
      }),
    },
  }
}