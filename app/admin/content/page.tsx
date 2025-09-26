import AdminLayout from "@/components/admin/admin-layout"
import ContentManagement from "@/components/admin/content-management"
import { getBoards } from "@/lib/actions/admin"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminContentPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/admin/login")
  }

  // Get admin profile from database
  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", user.email)
    .single()

  if (adminError || !adminProfile) {
    redirect("/admin/login")
  }

  // Get real board data from database
  const boards = await getBoards()

  return (
    <AdminLayout admin={adminProfile}>
      <ContentManagement boards={boards} />
    </AdminLayout>
  )
}