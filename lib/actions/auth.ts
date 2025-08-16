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

  if (!email || !password || !fullName) {
    return { error: "Email, password, and full name are required" }
  }

  const supabase = createClient()

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      },
    })

    if (authError) {
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: "Failed to create user account" }
    }

    const { error: dbError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: email,
      full_name: fullName,
      organization: organization || null,
      phone: phone || null,
      role: "educator",
      wallet_balance: 100,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error("Database error:", dbError)
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { error: "Database error saving new user" }
    }

    return { success: "Account created successfully! Check your email to confirm your account before signing in." }
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "An unexpected error occurred" }
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
