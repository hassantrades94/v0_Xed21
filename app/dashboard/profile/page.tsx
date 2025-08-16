import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import ProfileSettings from "@/components/dashboard/profile-settings"

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("email", user.email).single()

  return (
    <DashboardLayout user={user} userProfile={userProfile}>
      <ProfileSettings user={user} userProfile={userProfile} />
    </DashboardLayout>
  )
}
