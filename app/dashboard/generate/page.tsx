import DashboardLayout from "@/components/dashboard/dashboard-layout"
import QuestionGenerator from "@/components/dashboard/question-generator"
import { getBoards } from "@/lib/actions/questions"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function GeneratePage() {
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
  const boards = await getBoards()

  return (
    <DashboardLayout user={user} userProfile={userProfile}>
      <QuestionGenerator boards={boards} userProfile={userProfile} />
    </DashboardLayout>
  )
}
