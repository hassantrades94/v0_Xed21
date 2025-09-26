import AdminLayout from "@/components/admin/admin-layout"
import BloomSamplesManagement from "@/components/admin/bloom-samples-management"
import { getAllBloomSamples } from "@/lib/actions/admin"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminBloomSamplesPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/admin/login")
  }

  // Verify admin access
  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", user.email)
    .eq("is_active", true)
    .single()

  if (adminError || !adminProfile) {
    await supabase.auth.signOut()
    redirect("/admin/login")
  }

  // Get real bloom samples from database
  const bloomSamples = await getAllBloomSamples()

  return (
    <AdminLayout admin={adminProfile}>
      <BloomSamplesManagement samples={bloomSamples} />
    </AdminLayout>
  )
}