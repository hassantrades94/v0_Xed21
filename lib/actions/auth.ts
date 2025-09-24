"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      return { error: "Invalid credentials" }
    }

    try {
      revalidatePath("/", "layout")
    } catch (error) {
      console.warn("Revalidation skipped:", error)
    }
    redirect("/dashboard/generate")
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const organization = formData.get("organization") as string
  const phone = formData.get("phone") as string

  console.log("[v0] Starting signup process for:", email)

  if (!email || !password || !fullName) {
    return { error: "Email, password, and full name are required" }
  }

  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          organization: organization || null,
          phone: phone || null,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    // Insert user data into users table
    if (data.user) {
      await supabase.from("users").insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        phone: phone || null,
        organization: organization || null,
        role: "educator",
        wallet_balance: 500,
        is_active: true,
        is_verified: true,
      })
    }

    console.log("[v0] Signup completed successfully")
    return {
      success: "Account created successfully! You've received 500 free coins to get started.",
    }
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return { error: "An unexpected error occurred during signup" }
  }
}

export async function adminSignIn(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  // Check admin credentials
  if (email === "hassan.jobs07@gmail.com" && password === "Abutaleb@35") {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      try {
        revalidatePath("/", "layout")
      } catch (error) {
        console.warn("Revalidation skipped:", error)
      }
      redirect("/admin/dashboard")
    } catch (error) {
      console.error("Admin sign in error:", error)
      redirect("/admin/dashboard")
    }
  } else {
    return { error: "Invalid admin credentials" }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  try {
    revalidatePath("/", "layout")
  } catch (error) {
    console.warn("Revalidation skipped:", error)
  }
  redirect("/")
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get admin profile from admin_users table
  const { data: admin } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

  return admin
}

export async function verifyEmail(token: string) {
  const supabase = await createClient()

  try {
    // Find user with matching verification token
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", token)
      .single()

    if (userError || !user) {
      return { success: false, error: "Invalid verification token" }
    }

    if (user.is_verified) {
      return { success: false, error: "Email already verified" }
    }

    // Update user as verified and award 500 coins
    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_verified: true,
        wallet_balance: user.wallet_balance + 500,
      })
      .eq("id", user.id)

    if (updateError) {
      return { success: false, error: "Failed to verify email" }
    }

    // Record the coin transaction
    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      transaction_type: "credit",
      amount: 500,
      description: "Email verification bonus",
      balance_after: user.wallet_balance + 500,
      status: "completed",
    })

    return { success: true }
  } catch (error) {
    console.error("Email verification error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}