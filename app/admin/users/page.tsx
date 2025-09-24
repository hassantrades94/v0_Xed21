import AdminLayout from "@/components/admin/admin-layout"
import UserManagement from "@/components/admin/user-management"
import { getUsers } from "@/lib/actions/admin"

export default async function AdminUsersPage() {
  const mockAdmin = {
    id: "admin-1",
    full_name: "Hassan Admin",
    email: "hassan.jobs07@gmail.com",
    role: "super_admin",
    is_active: true,
  }

  // Get real user data from database
  const users = await getUsers()

  return (
    <AdminLayout admin={mockAdmin}>
      <UserManagement users={users} totalCount={users.length} />
    </AdminLayout>
  )
}
