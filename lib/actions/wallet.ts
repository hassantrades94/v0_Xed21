"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function topUpWallet(formData: FormData) {
  const supabase = createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  const amount = Number.parseFloat(formData.get("amount") as string)
  const paymentMethod = formData.get("payment_method") as string

  if (!amount || amount < 10 || amount > 50000) {
    throw new Error("Invalid amount. Must be between ₹10 and ₹50,000")
  }

  try {
    // Get current wallet balance
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("wallet_balance")
      .eq("id", user.id)
      .single()

    if (userError || !userData) {
      throw new Error("Failed to fetch user data")
    }

    // In a real implementation, this would integrate with payment gateway
    // For now, we'll simulate successful payment
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Update wallet balance
    const newBalance = userData.wallet_balance + amount
    const { error: updateError } = await supabase.from("users").update({ wallet_balance: newBalance }).eq("id", user.id)

    if (updateError) {
      throw new Error("Failed to update wallet balance")
    }

    // Record transaction
    const { error: transactionError } = await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "credit",
      amount: amount,
      description: `Wallet top-up via ${paymentMethod}`,
      status: "completed",
      reference_id: paymentId,
      reference_type: "top_up",
      balance_after: newBalance,
    })

    if (transactionError) {
      throw new Error("Failed to record transaction")
    }

    revalidatePath("/dashboard/wallet")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: `Successfully added ₹${amount} to your wallet`,
      newBalance,
    }
  } catch (error) {
    console.error("Wallet top-up error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to process payment")
  }
}

export async function getWalletTransactions(limit = 50) {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { transactions: [], error: "Not authenticated" }
  }

  const { data: transactions, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    return { transactions: [], error: error.message }
  }

  return { transactions, error: null }
}

export async function getWalletStats() {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { stats: null, error: "Not authenticated" }
  }

  const { data: transactions, error } = await supabase
    .from("wallet_transactions")
    .select("type, amount, reference_type")
    .eq("user_id", user.id)
    .eq("status", "completed")

  if (error) {
    return { stats: null, error: error.message }
  }

  const totalSpent = transactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0)

  const totalAdded = transactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0)

  const questionBatches = transactions.filter((t) => t.reference_type === "question_generation").length

  const avgPerBatch = questionBatches > 0 ? totalSpent / questionBatches : 0

  return {
    stats: {
      totalSpent,
      totalAdded,
      questionBatches,
      avgPerBatch,
    },
    error: null,
  }
}
