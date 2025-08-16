import DashboardLayout from "@/components/dashboard/dashboard-layout"
import QuestionGenerator from "@/components/dashboard/question-generator"

export default function GeneratePage() {
  // Mock user and profile data for demo
  const mockUser = {
    id: "demo-user",
    email: "geology.cupb16@gmail.com",
  }

  const mockUserProfile = {
    id: "demo-profile",
    full_name: "Mamun",
    email: "geology.cupb16@gmail.com",
    role: "educator",
    wallet_balance: 9500,
    organization: "Demo School",
  }

  // Mock boards data
  const mockBoards = [
    {
      id: 1,
      name: "CBSE",
      description: "Central Board of Secondary Education",
      is_active: true,
      subjects: [
        {
          id: 1,
          name: "Mathematics",
          board_id: 1,
          topics: [
            { id: 1, name: "Algebra", subject_id: 1 },
            { id: 2, name: "Geometry", subject_id: 1 },
            { id: 3, name: "Calculus", subject_id: 1 },
          ],
        },
        {
          id: 2,
          name: "Science",
          board_id: 1,
          topics: [
            { id: 4, name: "Physics", subject_id: 2 },
            { id: 5, name: "Chemistry", subject_id: 2 },
            { id: 6, name: "Biology", subject_id: 2 },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "ICSE",
      description: "Indian Certificate of Secondary Education",
      is_active: true,
      subjects: [
        {
          id: 3,
          name: "English",
          board_id: 2,
          topics: [
            { id: 7, name: "Grammar", subject_id: 3 },
            { id: 8, name: "Literature", subject_id: 3 },
          ],
        },
      ],
    },
  ]

  return (
    <DashboardLayout user={mockUser} userProfile={mockUserProfile}>
      <QuestionGenerator boards={mockBoards} userProfile={mockUserProfile} />
    </DashboardLayout>
  )
}
