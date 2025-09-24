import AdminLayout from "@/components/admin/admin-layout"
import AIRuleManagement from "@/components/admin/ai-rule-management"
import { getAllAIRules } from "@/lib/actions/admin"

export default async function AdminAIRulesPage() {
  const mockAdmin = {
    id: "admin-1",
    full_name: "Hassan Admin",
    email: "hassan.jobs07@gmail.com",
    role: "super_admin",
    is_active: true,
  }

  // Get real AI rules from database
  const aiRules = await getAllAIRules()

  return (
    <AdminLayout admin={mockAdmin}>
      <AIRuleManagement aiRules={aiRules} />
    </AdminLayout>
  )
}
