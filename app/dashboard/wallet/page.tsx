import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import WalletManager from "@/components/dashboard/wallet-manager"
import { getWalletTransactions, getWalletStats } from "@/lib/actions/wallet"

export default async function WalletPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get wallet transactions and stats
  const { transactions } = await getWalletTransactions()
  const { stats } = await getWalletStats()

  return (
    <DashboardLayout user={user} userProfile={userProfile}>
      <WalletManager userProfile={userProfile} transactions={transactions || []} stats={stats} />
    </DashboardLayout>
  )
}
