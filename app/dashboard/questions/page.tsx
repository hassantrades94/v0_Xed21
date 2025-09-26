import DashboardLayout from "@/components/dashboard/dashboard-layout"
import QuestionLibrary from "@/components/dashboard/question-library"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function QuestionsPage() {
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

  // Get user's questions from database
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select(`
      *,
      topics!inner(
        name,
        subjects!inner(
          name,
          boards!inner(
            name
          )
        )
      )
    `)
    .eq("user_id", user.id)
  const userQuestions = questions || []
    .order("created_at", { ascending: false })
  return (
    <DashboardLayout user={user} userProfile={userProfile}>
      <QuestionLibrary questions={userQuestions} />
    </DashboardLayout>
  )
}