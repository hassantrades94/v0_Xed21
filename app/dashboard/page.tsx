import DashboardLayout from "@/components/dashboard/dashboard-layout"
import DashboardOverview from "@/components/dashboard/dashboard-overview"

export default async function DashboardPage() {
  const mockUser = {
    id: "demo-user-id",
    email: "geology.cupb16@gmail.com",
    user_metadata: {
      full_name: "Mamun",
    },
  }

  const mockUserProfile = {
    id: "demo-profile-id",
    email: "geology.cupb16@gmail.com",
    full_name: "Mamun",
    role: "educator",
    wallet_balance: 9500,
    organization: "Demo School",
    phone: "+91 98765 43210",
    created_at: "2025-01-15T10:00:00Z",
  }

  return (
    <DashboardLayout user={mockUser} userProfile={mockUserProfile}>
      <DashboardOverview user={mockUser} userProfile={mockUserProfile} />
    </DashboardLayout>
  )
}
