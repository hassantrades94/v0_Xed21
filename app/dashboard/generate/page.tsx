import DashboardLayout from "@/components/dashboard/dashboard-layout"
import QuestionGenerator from "@/components/dashboard/question-generator"
import { getBoards } from "@/lib/actions/questions"

export default async function GeneratePage() {
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

  const boards = await getBoards()

  return (
    <DashboardLayout user={mockUser} userProfile={mockUserProfile}>
      <QuestionGenerator boards={boards} userProfile={mockUserProfile} />
    </DashboardLayout>
  )
}
