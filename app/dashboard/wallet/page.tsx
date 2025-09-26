import DashboardLayout from "@/components/dashboard/dashboard-layout"
import WalletManager from "@/components/dashboard/wallet-manager"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function WalletPage() {
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

  // Get user's transactions from database
  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Calculate wallet stats from real data
  const userTransactions = transactions || []
  const totalSpent = userTransactions
    .filter(t => t.transaction_type === "debit")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalAdded = userTransactions
    .filter(t => t.transaction_type === "credit")
    .reduce((sum, t) => sum + t.amount, 0)
  const questionBatches = userTransactions
    .filter(t => t.reference_type === "question_generation")
    .length
  const stats = {
    totalSpent,
    totalAdded,
    questionBatches,
    avgPerBatch
  }
  const avgPerBatch = questionBatches > 0 ? totalSpent / questionBatches : 0
  return (
    <DashboardLayout user={user} userProfile={userProfile}>
      <WalletManager userProfile={userProfile} transactions={userTransactions} stats={stats} />
    </DashboardLayout>
  )
}