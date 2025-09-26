"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
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
      return { error: error?.message || "Invalid credentials" }
    }

    redirect("/dashboard")
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }

export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const organization = formData.get("organization") as string || null
  const phone = formData.get("phone") as string

  console.log("[v0] Starting signup process for:", email)

  if (!email || !password || !fullName) {
    return { error: "Email, password, and full name are required" }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address" }
  }

  // Validate password strength
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" }
  }

  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()
    
    // Check if user already exists
    const { data: existingUser } = await adminSupabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single()

    if (existingUser) {
      return { error: "An account with this email already exists" }
    }

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
      console.error("[v0] Supabase auth signup error:", error)
      return { error: error.message }
    }

    if (!data.user) {
      console.error("[v0] No user data returned from Supabase auth")
      return { error: "Failed to create user account" }
    }

    console.log("[v0] Auth user created, inserting into users table:", data.user.id)

    // Insert user data into users table with proper error handling
    try {
      const { data: insertedUser, error: insertError } = await adminSupabase
        .from("users")
        .insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          phone: phone || null,
          organization: organization || null,
          role: "educator",
          wallet_balance: 500.00,
          is_active: true,
          is_verified: true,
        })
        .select()
        .single()

      if (insertError) {
        console.error("[v0] Database insert error:", insertError)
        
        // Clean up auth user if database insert fails
        await adminSupabase.auth.admin.deleteUser(data.user.id)
        
        return { error: "Failed to create user profile. Please try again." }
      }

      if (!insertedUser) {
        console.error("[v0] No user data returned from insert")
        return { error: "Failed to create user profile" }
      }

      console.log("[v0] User successfully inserted into database:", insertedUser.id)

      // Record welcome bonus transaction
      const { error: transactionError } = await adminSupabase
        .from("wallet_transactions")
        .insert({
          user_id: data.user.id,
          transaction_type: "credit",
          amount: 500.00,
          balance_after: 500.00,
          description: "Welcome bonus - Account creation",
          status: "completed",
        })

      if (transactionError) {
        console.error("[v0] Transaction insert error:", transactionError)
        // Don't fail signup for transaction error, just log it
      }

    } catch (dbError) {
      console.error("[v0] Database operation failed:", dbError)
      
      // Clean up auth user if database operations fail
      try {
        await adminSupabase.auth.admin.deleteUser(data.user.id)
      } catch (cleanupError) {
        console.error("[v0] Failed to cleanup auth user:", cleanupError)
      }
      
      return { error: "Database error occurred. Please try again." }
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

  try {
    const supabase = await createClient()
    
    // First authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      return { error: "Invalid credentials" }
    }

    // Check if user exists in admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .single()

    if (adminError || !adminUser) {
      // Sign out the user since they're not an admin
      await supabase.auth.signOut()
      return { error: "Access denied. Admin privileges required." }
    }

    // Successful admin login - revalidate and redirect
    redirect("/admin/dashboard")
  } catch (error) {
    console.error("Admin sign in error:", error)
    return { error: "An unexpected error occurred during login" }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
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