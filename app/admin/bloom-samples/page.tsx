import AdminLayout from "@/components/admin/admin-layout"
import BloomSamplesManagement from "@/components/admin/bloom-samples-management"

export default function AdminBloomSamplesPage() {
  const mockAdmin = {
    id: "admin-1",
    full_name: "Hassan Admin",
    email: "hassan.jobs07@gmail.com",
    role: "super_admin",
    is_active: true,
  }

  return (
    <AdminLayout admin={mockAdmin}>
      <BloomSamplesManagement />
    </AdminLayout>
  )
}
