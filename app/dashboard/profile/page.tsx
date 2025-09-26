import DashboardLayout from "@/components/dashboard/dashboard-layout"
import ProfileSettings from "@/components/dashboard/profile-settings"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError || !userProfile) {
    redirect("/auth/signup")
  }
  return (
    <DashboardLayout user={user} userProfile={userProfile}>
      <ProfileSettings user={user} userProfile={userProfile} />
    </DashboardLayout>
  )
}