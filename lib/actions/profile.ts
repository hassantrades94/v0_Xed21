"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  const fullName = formData.get("fullName") as string
  const phone = formData.get("phone") as string
  const organization = formData.get("organization") as string
  const role = formData.get("role") as string

  if (!fullName) {
    throw new Error("Full name is required")
  }

  try {
    const { error } = await supabase
      .from("users")
      .update({
        full_name: fullName,
        phone: phone || null,
        organization: organization || null,
        role: role as any,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      throw new Error("Failed to update profile")
    }

    revalidatePath("/dashboard/profile")
    revalidatePath("/dashboard")
    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Profile update error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update profile")
  }
}

export async function updateUserPassword(formData: FormData) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("All password fields are required")
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New passwords don't match")
  }

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long")
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw new Error("Failed to update password")
    }

    revalidatePath("/dashboard/profile")
    return { success: true, message: "Password updated successfully" }
  } catch (error) {
    console.error("Password update error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update password")
  }
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    throw new Error("Failed to fetch user profile")
  }

  return profile
}