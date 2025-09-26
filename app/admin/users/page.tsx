import AdminLayout from "@/components/admin/admin-layout"
import UserManagement from "@/components/admin/user-management"
import { getUsers } from "@/lib/actions/admin"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminUsersPage() {
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

  // Get real user data from database
  const users = await getUsers()

  return (
    <AdminLayout admin={adminProfile}>
      <UserManagement users={users} totalCount={users.length} />
    </AdminLayout>
  )
}