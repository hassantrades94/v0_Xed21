// Mock Supabase server client for Bolt environment
export async function createClient() {
  // Mock user data
  const mockUser = {
    id: "demo-user-123",
    email: "geology.cupb16@gmail.com",
    user_metadata: { full_name: "Mamun" },
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  }

  const mockAdmin = {
    id: "admin-1",
    email: "hassan.jobs07@gmail.com",
    user_metadata: { full_name: "Hassan Admin" },
    app_metadata: { role: "admin" },
    aud: "authenticated",
    created_at: new Date().toISOString(),
  }

  // Mock data storage
  const mockData = {
    users: [
      {
        id: "demo-user-123",
        email: "geology.cupb16@gmail.com",
        full_name: "Mamun",
        role: "educator",
        wallet_balance: 9500,
        is_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ],
    admin_users: [
      {
        id: "admin-1",
        email: "hassan.jobs07@gmail.com",
        full_name: "Hassan Admin",
        role: "super_admin",
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ],
    boards: [
      { id: "cbse", name: "CBSE/NCERT", code: "CBSE", description: "Central Board of Secondary Education" },
      { id: "icse", name: "ICSE/CISCE", code: "ICSE", description: "Indian Certificate of Secondary Education" },
      { id: "state", name: "State Boards", code: "STATE", description: "Various State Education Boards" },
    ],
    subjects: [
      { id: "cbse-science-6", board_id: "cbse", name: "Science", code: "SCI6", grade_level: 6 },
      { id: "cbse-math-6", board_id: "cbse", name: "Mathematics", code: "MAT6", grade_level: 6 },
      { id: "cbse-english-6", board_id: "cbse", name: "English", code: "ENG6", grade_level: 6 },
      { id: "cbse-hindi-6", board_id: "cbse", name: "Hindi", code: "HIN6", grade_level: 6 },
      { id: "cbse-sst-6", board_id: "cbse", name: "Social Science", code: "SST6", grade_level: 6 },
    ],
    topics: [
      { id: "exploring-magnets", subject_id: "cbse-science-6", name: "Exploring Magnets", description: "Understanding magnetic properties and behavior" },
      { id: "light-shadows", subject_id: "cbse-science-6", name: "Light and Shadows", description: "Properties of light and shadow formation" },
      { id: "motion-measurement", subject_id: "cbse-science-6", name: "Motion and Measurement", description: "Types of motion and measurement of distances" },
      { id: "materials-around-us", subject_id: "cbse-science-6", name: "Materials Around Us", description: "Classification and properties of materials" },
      { id: "living-organisms", subject_id: "cbse-science-6", name: "Living Organisms and Their Surroundings", description: "Characteristics of living things" },
      { id: "components-food", subject_id: "cbse-science-6", name: "Components of Food", description: "Nutrients and their importance" },
    ],
    questions: [],
    wallet_transactions: [],
    ai_rules: [
      {
        id: "rule-1",
        rule_type: "global",
        rule_name: "Clear Questions",
        rule_content: "Questions should be clear and concise",
        is_active: true,
        question_type: null,
      },
    ],
    bloom_samples: [
      {
        id: "sample-1",
        bloom_level: "remembering",
        grade: 6,
        subject: "science",
        sample_question: "What is the capital of India?",
        explanation: "This tests basic recall of geographical facts",
        status: "active",
      },
    ],
  }

  return {
    auth: {
      getUser: async () => {
        // Return mock user or null based on context
        return { data: { user: mockUser }, error: null }
      },
      signUp: async (credentials: any) => {
        return { data: { user: mockUser }, error: null }
      },
      signInWithPassword: async (credentials: any) => {
        if (credentials.email === "hassan.jobs07@gmail.com") {
          return { data: { user: mockAdmin }, error: null }
        }
        return { data: { user: mockUser }, error: null }
      },
      signOut: async () => {
        return { error: null }
      },
    },
    from: (table: string) => ({
      select: (columns = "*") => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            const data = mockData[table as keyof typeof mockData] as any[]
            const item = data?.find((item) => item[column] === value)
            return { data: item || null, error: item ? null : { message: "Not found" } }
          },
          limit: (count: number) => ({
            all: async () => {
              const data = mockData[table as keyof typeof mockData] as any[]
              return { data: data?.slice(0, count) || [], error: null }
            },
          }),
        }),
        gte: (column: string, value: any) => ({
          lte: (column2: string, value2: any) => ({
            limit: (count: number) => ({
              all: async () => {
                const data = mockData[table as keyof typeof mockData] as any[]
                return { data: data?.slice(0, count) || [], error: null }
              },
            }),
          }),
        }),
        order: (column: string, options?: any) => ({
          limit: (count: number) => ({
            all: async () => {
              const data = mockData[table as keyof typeof mockData] as any[]
              return { data: data?.slice(0, count) || [], error: null }
            },
          }),
        }),
        single: async () => {
          const data = mockData[table as keyof typeof mockData] as any[]
          return { data: data?.[0] || null, error: null }
        },
        all: async () => {
          const data = mockData[table as keyof typeof mockData] as any[]
          return { data: data || [], error: null }
        },
      }),
      insert: (values: any) => ({
        select: () => ({
          all: async () => {
            const insertedData = Array.isArray(values) ? values : [values]
            return { data: insertedData, error: null }
          },
        }),
        single: async () => {
          return { data: values, error: null }
        },
      }),
      update: (values: any) => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            return { data: { ...values, [column]: value }, error: null }
          },
        }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            return { data: null, error: null }
          },
        }),
      }),
    }),
  }
}