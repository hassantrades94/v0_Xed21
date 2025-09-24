import AdminLayout from "@/components/admin/admin-layout"
import AdminOverview from "@/components/admin/admin-overview"
import { getDashboardStats } from "@/lib/actions/admin"

export default async function AdminDashboardPage() {
  // Mock admin data for demo
  const mockAdmin = {
    id: "admin-1",
    full_name: "Hassan Admin",
    email: "hassan.jobs07@gmail.com",
    role: "super_admin",
    is_active: true,
  }

  // Get real dashboard data from database
  const dashboardData = await getDashboardStats()

  return (
    <AdminLayout admin={mockAdmin}>
      <AdminOverview data={dashboardData} />
    </AdminLayout>
  )
}
