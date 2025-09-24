import DashboardLayout from "@/components/dashboard/dashboard-layout"
import QuestionLibrary from "@/components/dashboard/question-library"

export default function QuestionsPage() {
  // Mock user data for demo
  const mockUser = {
    id: "demo-user-123",
    email: "geology.cupb16@gmail.com",
    user_metadata: { full_name: "Mamun" },
  }

  const mockUserProfile = {
    id: "demo-profile-123",
    email: "geology.cupb16@gmail.com",
    full_name: "Mamun",
    role: "educator",
    wallet_balance: 9500,
    organization: "Demo School",
    phone: "+91 98765 43210",
    created_at: "2025-01-15T10:00:00Z",
  }

  // Mock questions data
  const mockQuestions = [
    {
      id: "q1",
      question_text: "What is the main source of light on Earth?",
      question_type: "mcq",
      difficulty_level: "easy",
      bloom_taxonomy_level: "remembering",
      correct_answer: "B",
      explanation: "The Sun is the primary source of natural light on Earth.",
      created_at: "2025-01-15T10:00:00Z",
      topics: {
        name: "Light and Shadows",
        subjects: {
          name: "Science",
          boards: {
            name: "CBSE/NCERT"
          }
        }
      },
      is_approved: true
    }
  ]

  return (
    <DashboardLayout user={mockUser} userProfile={mockUserProfile}>
      <QuestionLibrary questions={mockQuestions} />
    </DashboardLayout>
  )
}