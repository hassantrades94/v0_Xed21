"use server"

import { getUserByEmail, createUser, getAdminByEmail } from "@/lib/database/queries"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }


  try {
    // Check if user exists in database
    const user = getUserByEmail(email)
    
    if (!user || !user.is_active) {
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


  try {
    console.log("[v0] Checking for existing user...")
    
    const existingUser = getUserByEmail(email)
    if (existingUser) {
      console.log("[v0] User already exists")
      return { error: "An account with this email already exists" }
    }

    console.log("[v0] Creating user...")
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log("[v0] Inserting user into database...")

    const userData = {
      id: userId,
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

    try {
      createUser(userData)
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
      return { error: "Failed to create user account" }
    }

    console.log("[v0] User created successfully")

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
  const admin = getAdminByEmail(email)
  if (admin && email === "hassan.jobs07@gmail.com" && password === "Abutaleb@35") {
    try {
      revalidatePath("/", "layout")
    } catch (error) {
      // Ignore revalidation errors during static generation
      console.warn("Revalidation skipped:", error)
    }
    redirect("/admin/dashboard")
  } else {
    return { error: "Invalid admin credentials" }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}

export async function getUser() {
  // Return demo user for now
  return getUserById('demo-user-123')
}

export async function getAdmin() {
  const supabase = await createClient()
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
