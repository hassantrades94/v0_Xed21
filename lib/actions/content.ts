"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// Board actions
export async function createBoard(data: { name: string; description?: string; code?: string }) {
  const supabase = createClient()

  // Check admin authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/admin/login")
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (adminError || !adminUser) {
    redirect("/admin/login")
  }

  const { error } = await supabase.from("boards").insert({
    name: data.name,
    description: data.description,
    code: data.code,
  })

  if (error) {
    throw new Error("Failed to create board")
  }

  revalidatePath("/admin/content")
  return { success: true, message: "Board created successfully" }
}

export async function updateBoard(id: string, data: { name: string; description?: string; code?: string }) {
  const supabase = createClient()

  const { error } = await supabase
    .from("boards")
    .update({
      name: data.name,
      description: data.description,
      code: data.code,
    })
    .eq("id", id)

  if (error) {
    throw new Error("Failed to update board")
  }

  revalidatePath("/admin/content")
  return { success: true, message: "Board updated successfully" }
}

export async function deleteBoard(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from("boards").delete().eq("id", id)

  if (error) {
    throw new Error("Failed to delete board")
  }

  revalidatePath("/admin/content")
  return { success: true, message: "Board deleted successfully" }
}

// Subject actions
export async function createSubject(data: { name: string; description?: string; code?: string; boardId: string }) {
  const supabase = createClient()

  const { error } = await supabase.from("subjects").insert({
    name: data.name,
    description: data.description,
    code: data.code,
    board_id: data.boardId,
  })

  if (error) {
    throw new Error("Failed to create subject")
  }

  revalidatePath("/admin/content")
  return { success: true, message: "Subject created successfully" }
}

export async function updateSubject(id: string, data: { name: string; description?: string; code?: string }) {
  const supabase = createClient()

  const { error } = await supabase
    .from("subjects")
    .update({
      name: data.name,
      description: data.description,
      code: data.code,
    })
    .eq("id", id)

  if (error) {
    throw new Error("Failed to update subject")
  }

  revalidatePath("/admin/content")
  return { success: true, message: "Subject updated successfully" }
}

export async function deleteSubject(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from("subjects").delete().eq("id", id)

  if (error) {
    throw new Error("Failed to delete subject")
  }

  revalidatePath("/admin/content")
  return { success: true, message: "Subject deleted successfully" }
}

// Topic actions
export async function createTopic(data: { name: string; description?: string; subjectId: string }) {
  const supabase = createClient()

  const { error } = await supabase.from("topics").insert({
    name: data.name,
    description: data.description,
    subject_id: data.subjectId,
  })

  if (error) {
    throw new Error("Failed to create topic")
  }

  revalidatePath("/admin/content")
  return { success: true, message: "Topic created successfully" }
}

export async function updateTopic(id: string, data: { name: string; description?: string }) {
  const supabase = createClient()

  const { error } = await supabase
    .from("topics")
    .update({
      name: data.name,
      description: data.description,
    })
    .eq("id", id)

  if (error) {
    throw new Error("Failed to update topic")
  }

  revalidatePath("/admin/content")
  return { success: true, message: "Topic updated successfully" }
}

export async function deleteTopic(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from("topics").delete().eq("id", id)

  if (error) {
    throw new Error("Failed to delete topic")
  }

  revalidatePath("/admin/content")
  return { success: true, message: "Topic deleted successfully" }
}
