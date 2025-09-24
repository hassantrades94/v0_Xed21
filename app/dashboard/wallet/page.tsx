import DashboardLayout from "@/components/dashboard/dashboard-layout"
import WalletManager from "@/components/dashboard/wallet-manager"

export default function WalletPage() {
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

  // Mock transactions and stats
  const mockTransactions = [
    {
      id: "t1",
      type: "credit",
      amount: 500,
      description: "Welcome bonus - Email verification",
      created_at: "2025-01-15T10:00:00Z",
      status: "completed",
      balance_after: 500,
      reference_type: "bonus"
    }
  ]

  const mockStats = {
    totalSpent: 35,
    totalAdded: 500,
    questionBatches: 1,
    avgPerBatch: 35
  }

  return (
    <DashboardLayout user={mockUser} userProfile={mockUserProfile}>
      <WalletManager userProfile={mockUserProfile} transactions={mockTransactions} stats={mockStats} />
    </DashboardLayout>
  )
}