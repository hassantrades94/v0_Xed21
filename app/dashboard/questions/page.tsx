import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import QuestionLibrary from "@/components/dashboard/question-library"

export default async function QuestionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile and their questions
  const { data: userProfile } = await supabase.from("users").select("*").eq("email", user.email).single()

  const { data: questions } = await supabase
    .from("questions")
    .select(`
      *,
      topics (
        name,
        subjects (
          name,
          boards (name)
        )
      )
    `)
    .eq("user_id", userProfile?.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout user={user} userProfile={userProfile}>
      <QuestionLibrary questions={questions || []} />
    </DashboardLayout>
  )
}
