import AdminLayout from "@/components/admin/admin-layout"
import UserManagement from "@/components/admin/user-management"

export default function AdminUsersPage() {
  const mockAdmin = {
    id: "admin-1",
    full_name: "Hassan Admin",
    email: "hassan.jobs07@gmail.com",
    role: "super_admin",
    is_active: true,
  }

  // Mock user data matching your screenshot
  const mockUsers = [
    {
      id: 1,
      full_name: "Ekbal Hassan",
      email: "bellbottom743@gmail.com",
      wallet_balance: 465,
      is_active: true,
      created_at: "2025-08-10",
    },
    {
      id: 2,
      full_name: "Mamun",
      email: "geology.cupb16@gmail.com",
      wallet_balance: 9465,
      is_active: true,
      created_at: "2025-08-07",
    },
    {
      id: 3,
      full_name: "Hassan Test User",
      email: "hassan.jobs07@gmail.com",
      wallet_balance: 1000,
      is_active: true,
      created_at: "2025-08-06",
    },
  ]

  return (
    <AdminLayout admin={mockAdmin}>
      <UserManagement users={mockUsers} totalCount={mockUsers.length} />
    </AdminLayout>
  )
}
