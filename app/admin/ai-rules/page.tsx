import AdminLayout from "@/components/admin/admin-layout"
import AIRuleManagement from "@/components/admin/ai-rule-management"

export default function AdminAIRulesPage() {
  const mockAdmin = {
    id: "admin-1",
    full_name: "Hassan Admin",
    email: "hassan.jobs07@gmail.com",
    role: "super_admin",
    is_active: true,
  }

  return (
    <AdminLayout admin={mockAdmin}>
      <AIRuleManagement />
    </AdminLayout>
  )
}
