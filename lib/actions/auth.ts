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

  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    // Check if user exists in users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, role, is_active")
      .eq("email", email)
      .single()

    if (userError || !user || !user.is_active) {
      await supabase.auth.signOut()
      return { error: "Account not found or inactive" }
    }

    revalidatePath("/", "layout")
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

  const supabase = createClient()

  try {
    console.log("[v0] Checking for existing user...")
    // First check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" which is expected
      console.error("[v0] Error checking existing user:", checkError)
      return { error: "Database connection error" }
    }

    if (existingUser) {
      console.log("[v0] User already exists")
      return { error: "An account with this email already exists" }
    }

    console.log("[v0] Creating auth user...")
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error("[v0] Auth error:", authError)
      return { error: authError.message }
    }

    if (!authData.user) {
      console.error("[v0] No user data returned from auth")
      return { error: "Failed to create user account" }
    }

    console.log("[v0] Auth user created with ID:", authData.user.id)
    console.log("[v0] Inserting user into database...")

    const userData = {
      id: authData.user.id,
      email: email,
      full_name: fullName,
      phone: phone || null,
      organization: organization || null,
      role: "educator",
      wallet_balance: 500,
      is_active: true,
      is_verified: true,
    }

    console.log("[v0] User data to insert:", userData)

    const { error: dbError } = await supabase.from("users").insert(userData)

    if (dbError) {
      console.error("[v0] Database error details:", {
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code,
      })
      return { error: `Database error: ${dbError.message}` }
    }

    console.log("[v0] User inserted successfully, creating wallet transaction...")

    const { error: transactionError } = await supabase.from("wallet_transactions").insert({
      user_id: authData.user.id,
      transaction_type: "credit",
      amount: 500,
      description: "Welcome bonus - 500 free coins",
      balance_after: 500,
      status: "completed",
    })

    if (transactionError) {
      console.error("[v0] Transaction error:", transactionError)
      // Don't fail signup if transaction fails
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

  // Check hardcoded admin credentials
  if (email === "hassan.jobs07@gmail.com" && password === "Abutaleb@35") {
    revalidatePath("/", "layout")
    redirect("/admin/dashboard")
  } else {
    return { error: "Invalid admin credentials" }
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}

export async function getUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile from users table
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return profile
}

export async function getAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get admin profile from admin_users table
  const { data: admin } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

  return admin
}

export async function verifyEmail(token: string) {
  const supabase = createClient()

  try {
    // Find user with matching verification token (this function may not be used in current flow)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", token) // Using ID as token for simplicity
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
