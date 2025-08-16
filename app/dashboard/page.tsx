import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import DashboardOverview from "@/components/dashboard/dashboard-overview"

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile data
  const { data: userProfile } = await supabase.from("users").select("*").eq("email", user.email).single()

  return (
    <DashboardLayout user={user} userProfile={userProfile}>
      <DashboardOverview user={user} userProfile={userProfile} />
    </DashboardLayout>
  )
}
