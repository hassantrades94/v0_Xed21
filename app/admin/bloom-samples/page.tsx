import AdminLayout from "@/components/admin/admin-layout"
import BloomSamplesManagement from "@/components/admin/bloom-samples-management"
import { getAllBloomSamples } from "@/lib/actions/admin"

export default async function AdminBloomSamplesPage() {
  const mockAdmin = {
    id: "admin-1",
    full_name: "Hassan Admin",
    email: "hassan.jobs07@gmail.com",
    role: "super_admin",
    is_active: true,
  }

  // Get real bloom samples from database
  const bloomSamples = await getAllBloomSamples()

  return (
    <AdminLayout admin={mockAdmin}>
      <BloomSamplesManagement samples={bloomSamples} />
    </AdminLayout>
  )
}
