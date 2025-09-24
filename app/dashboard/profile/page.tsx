import DashboardLayout from "@/components/dashboard/dashboard-layout"
import ProfileSettings from "@/components/dashboard/profile-settings"

export default function ProfilePage() {
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

  return (
    <DashboardLayout user={mockUser} userProfile={mockUserProfile}>
      <ProfileSettings user={mockUser} userProfile={mockUserProfile} />
    </DashboardLayout>
  )
}