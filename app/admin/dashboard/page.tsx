import AdminLayout from "@/components/admin/admin-layout"
import AdminOverview from "@/components/admin/admin-overview"
import { getDashboardStats } from "@/lib/actions/admin"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/admin/login")
  }

  // Verify admin access by checking admin_users table
  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", user.email)
    .eq("is_active", true)
    .single()

  if (adminError || !adminProfile) {
    // User is authenticated but not an admin - sign them out and redirect
    await supabase.auth.signOut()
    redirect("/admin/login")
  }

  // Get real dashboard data from database
  const dashboardData = await getDashboardStats()

  return (
    <AdminLayout admin={adminProfile}>
      <AdminOverview data={dashboardData} />
    </AdminLayout>
  )
}