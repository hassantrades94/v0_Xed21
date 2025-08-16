import AdminLayout from "@/components/admin/admin-layout"
import AdminOverview from "@/components/admin/admin-overview"

export default async function AdminDashboardPage() {
  // Mock admin data for demo
  const mockAdmin = {
    id: "admin-1",
    full_name: "Hassan Admin",
    email: "hassan.jobs07@gmail.com",
    role: "super_admin",
    is_active: true,
  }

  // Mock dashboard data
  const mockDashboardData = {
    totalUsers: 156,
    totalQuestions: 2847,
    pendingQuestions: 23,
    totalRequests: 1205,
    recentUsers: [
      { id: 1, full_name: "Mamun", email: "geology.cupb16@gmail.com", created_at: "2025-08-15" },
      { id: 2, full_name: "Ekbal Hassan", email: "bellbottom743@gmail.com", created_at: "2025-08-14" },
      { id: 3, full_name: "Hassan Test User", email: "hassan.jobs07@gmail.com", created_at: "2025-08-13" },
    ],
    recentQuestions: [
      { id: 1, question_text: "What is photosynthesis?", users: { full_name: "Mamun" }, topics: { name: "Biology" } },
      {
        id: 2,
        question_text: "Solve for x: 2x + 5 = 15",
        users: { full_name: "Ekbal Hassan" },
        topics: { name: "Algebra" },
      },
    ],
  }

  return (
    <AdminLayout admin={mockAdmin}>
      <AdminOverview data={mockDashboardData} />
    </AdminLayout>
  )
}
