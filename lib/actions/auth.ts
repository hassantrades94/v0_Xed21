"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { sendVerificationEmail } from "@/lib/email"
import { randomBytes } from "crypto"

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

  if (!email || !password || !fullName) {
    return { error: "Email, password, and full name are required" }
  }

  const supabase = createClient()

  try {
    // First check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return { error: "An account with this email already exists" }
    }

    const verificationToken = randomBytes(32).toString("hex")
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error("Auth error:", authError)
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: "Failed to create user account" }
    }

    const { error: dbError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: email,
      full_name: fullName,
      phone: phone || null,
      role: "educator",
      wallet_balance: 0, // Start with 0, award 500 on verification
      is_active: true,
      email_verified: false,
      verification_token: verificationToken,
      verification_token_expires: tokenExpiry.toISOString(),
    })

    if (dbError) {
      console.error("Database error:", dbError)
      return { error: "Database error saving new user. Please try again." }
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken)
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      // Don't fail signup if email fails, but log it
    }

    return {
      success: "Account created successfully! Check your email to verify your account and claim your 500 free coins.",
    }
  } catch (error) {
    console.error("Signup error:", error)
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
    // Find user with matching verification token
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("verification_token", token)
      .gt("verification_token_expires", new Date().toISOString())
      .single()

    if (userError || !user) {
      return { success: false, error: "Invalid or expired verification token" }
    }

    if (user.email_verified) {
      return { success: false, error: "Email already verified" }
    }

    // Update user as verified and award 500 coins
    const { error: updateError } = await supabase
      .from("users")
      .update({
        email_verified: true,
        wallet_balance: user.wallet_balance + 500,
        verification_token: null,
        verification_token_expires: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      return { success: false, error: "Failed to verify email" }
    }

    // Record the coin transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "credit",
      amount: 500,
      description: "Email verification bonus",
      created_at: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error("Email verification error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
