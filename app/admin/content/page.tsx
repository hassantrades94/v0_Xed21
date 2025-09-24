import AdminLayout from "@/components/admin/admin-layout"
import ContentManagement from "@/components/admin/content-management"
import { getBoards } from "@/lib/actions/admin"

export default async function AdminContentPage() {
  const mockAdmin = {
    id: "admin-1",
    full_name: "Hassan Admin",
    email: "hassan.jobs07@gmail.com",
    role: "super_admin",
    is_active: true,
  }

  // Get real board data from database
  const boards = await getBoards()

  return (
    <AdminLayout admin={mockAdmin}>
      <ContentManagement boards={boards} />
    </AdminLayout>
  )
}
