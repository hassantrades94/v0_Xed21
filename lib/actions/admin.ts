"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/supabase/types"

type User = Database['public']['Tables']['users']['Row']
type AdminUser = Database['public']['Tables']['admin_users']['Row']
type Board = Database['public']['Tables']['boards']['Row']
type Subject = Database['public']['Tables']['subjects']['Row']
type Topic = Database['public']['Tables']['topics']['Row']

// Authentication helper
async function requireAdminAuth() {
  const supabase = await createClient()
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect("/admin/login")
  }

  // Check if user is admin
  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", user.email)
    .single()

  if (adminError || !adminUser) {
    redirect("/admin/login")
  }

  return { user, adminUser }
}

// User management actions
export async function updateUserCoins(userId: string, newBalance: number) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    // Get current balance
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("wallet_balance")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      throw new Error("User not found")
    }

    // Update wallet balance
    const { error: updateError } = await supabase
      .from("users")
      .update({ wallet_balance: newBalance })
      .eq("id", userId)

    if (updateError) {
      throw new Error("Failed to update wallet balance")
    }

    // Record transaction
    const { error: transactionError } = await supabase.from("wallet_transactions").insert({
      user_id: userId,
      transaction_type: "credit",
      amount: newBalance - userData.wallet_balance,
      description: "Admin balance adjustment",
      status: "completed",
      balance_after: newBalance,
    })

    if (transactionError) {
      console.error("Transaction recording failed:", transactionError)
    }

    revalidatePath("/admin/users")
    return { success: true, message: "User coins updated successfully" }
  } catch (error) {
    console.error("Error updating user coins:", error)
    return { success: false, message: "Failed to update user coins" }
  }
}

export async function suspendUser(userId: string) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase
      .from("users")
      .update({ is_active: false })
      .eq("id", userId)

    if (error) {
      throw new Error("Failed to suspend user")
    }

    revalidatePath("/admin/users")
    return { success: true, message: "User suspended successfully" }
  } catch (error) {
    console.error("Error suspending user:", error)
    return { success: false, message: "Failed to suspend user" }
  }
}

export async function deleteUser(userId: string) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId)

    if (error) {
      throw new Error("Failed to delete user")
    }

    revalidatePath("/admin/users")
    return { success: true, message: "User deleted successfully" }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, message: "Failed to delete user" }
  }
}

export async function getUsers(): Promise<User[]> {
  const supabase = await createClient()

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return []
    }

    return users || []
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function getDashboardStats() {
  const supabase = await createClient()

  try {
    // Get total users count
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    // Get total questions count
    const { count: totalQuestions } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })

    // Get pending questions count
    const { count: pendingQuestions } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", false)

    // Get total requests count
    const { count: totalRequests } = await supabase
      .from("question_requests")
      .select("*", { count: "exact", head: true })

    // Get recent users
    const { data: recentUsers } = await supabase
      .from("users")
      .select("id, full_name, email, created_at, is_active")
      .order("created_at", { ascending: false })
      .limit(5)

    // Get recent questions with user and topic info
    const { data: recentQuestions } = await supabase
      .from("questions")
      .select(`
        id, question_text, is_approved, created_at,
        users!inner(full_name),
        topics!inner(name)
      `)
      .order("created_at", { ascending: false })
      .limit(5)

    return {
      totalUsers: totalUsers || 0,
      totalQuestions: totalQuestions || 0,
      pendingQuestions: pendingQuestions || 0,
      totalRequests: totalRequests || 0,
      recentUsers: recentUsers || [],
      recentQuestions: (recentQuestions || []).map(q => ({
        ...q,
        user_name: q.users?.full_name,
        topic_name: q.topics?.name
      }))
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalUsers: 0,
      totalQuestions: 0,
      pendingQuestions: 0,
      totalRequests: 0,
      recentUsers: [],
      recentQuestions: []
    }
  }
}

// Content management actions
export async function getBoards(): Promise<Board[]> {
  const supabase = await createClient()

  try {
    const { data: boards, error } = await supabase
      .from("boards")
      .select("*")
      .order("name")

    if (error) {
      console.error("Error fetching boards:", error)
      return []
    }

    return boards || []
  } catch (error) {
    console.error("Error fetching boards:", error)
    return []
  }
}

export async function createBoard(data: { name: string; code: string; description?: string }) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase.from("boards").insert({
      name: data.name,
      code: data.code,
      description: data.description,
    })

    if (error) {
      throw new Error("Failed to create board")
    }

    revalidatePath("/admin/content")
    return { success: true, message: "Board created successfully" }
  } catch (error) {
    console.error("Error creating board:", error)
    return { success: false, message: "Failed to create board" }
  }
}

export async function updateBoard(id: string, data: { name: string; code: string; description?: string }) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase
      .from("boards")
      .update({
        name: data.name,
        code: data.code,
        description: data.description,
      })
      .eq("id", id)

    if (error) {
      throw new Error("Failed to update board")
    }

    revalidatePath("/admin/content")
    return { success: true, message: "Board updated successfully" }
  } catch (error) {
    console.error("Error updating board:", error)
    return { success: false, message: "Failed to update board" }
  }
}

export async function deleteBoard(id: string) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase.from("boards").delete().eq("id", id)

    if (error) {
      throw new Error("Failed to delete board")
    }

    revalidatePath("/admin/content")
    return { success: true, message: "Board deleted successfully" }
  } catch (error) {
    console.error("Error deleting board:", error)
    return { success: false, message: "Failed to delete board" }
  }
}

export async function getSubjectsForBoard(boardId: string, grade: number): Promise<Subject[]> {
  const supabase = await createClient()

  try {
    const { data: subjects, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("board_id", boardId)
      .eq("grade_level", grade)
      .order("name")

    if (error) {
      console.error("Error fetching subjects:", error)
      return []
    }

    return subjects || []
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return []
  }
}

export async function createSubject(data: { name: string; code: string; boardId: string; gradeLevel: number }) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase.from("subjects").insert({
      board_id: data.boardId,
      name: data.name,
      code: data.code,
      grade_level: data.gradeLevel,
    })

    if (error) {
      throw new Error("Failed to create subject")
    }

    revalidatePath("/admin/content")
    return { success: true, message: "Subject created successfully" }
  } catch (error) {
    console.error("Error creating subject:", error)
    return { success: false, message: "Failed to create subject" }
  }
}

export async function updateSubject(id: string, data: { name: string; code: string; gradeLevel?: number }) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const updateData: any = {
      name: data.name,
      code: data.code,
    }
    
    if (data.gradeLevel) {
      updateData.grade_level = data.gradeLevel
    }

    const { error } = await supabase
      .from("subjects")
      .update(updateData)
      .eq("id", id)

    if (error) {
      throw new Error("Failed to update subject")
    }

    revalidatePath("/admin/content")
    return { success: true, message: "Subject updated successfully" }
  } catch (error) {
    console.error("Error updating subject:", error)
    return { success: false, message: "Failed to update subject" }
  }
}

export async function deleteSubject(id: string) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase.from("subjects").delete().eq("id", id)

    if (error) {
      throw new Error("Failed to delete subject")
    }

    revalidatePath("/admin/content")
    return { success: true, message: "Subject deleted successfully" }
  } catch (error) {
    console.error("Error deleting subject:", error)
    return { success: false, message: "Failed to delete subject" }
  }
}
export async function getTopicsForSubject(subjectId: string): Promise<Topic[]> {
  const supabase = await createClient()

  try {
    const { data: topics, error } = await supabase
      .from("topics")
      .select("*")
      .eq("subject_id", subjectId)
      .order("order_index")

    if (error) {
      console.error("Error fetching topics:", error)
      return []
    }

    return topics || []
  } catch (error) {
    console.error("Error fetching topics:", error)
    return []
  }
}

export async function createTopic(data: { name: string; description?: string; subjectId: string }) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase.from("topics").insert({
      subject_id: data.subjectId,
      name: data.name,
      description: data.description,
    })

    if (error) {
      throw new Error("Failed to create topic")
    }

    revalidatePath("/admin/content")
    return { success: true, message: "Topic created successfully" }
  } catch (error) {
    console.error("Error creating topic:", error)
    return { success: false, message: "Failed to create topic" }
  }
}

export async function updateTopic(id: string, data: { name: string; description?: string }) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
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
  } catch (error) {
    console.error("Error updating topic:", error)
    return { success: false, message: "Failed to update topic" }
  }
}

export async function deleteTopic(id: string) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase.from("topics").delete().eq("id", id)

    if (error) {
      throw new Error("Failed to delete topic")
    }

    revalidatePath("/admin/content")
    return { success: true, message: "Topic deleted successfully" }
  } catch (error) {
    console.error("Error deleting topic:", error)
    return { success: false, message: "Failed to delete topic" }
  }
}

export async function updateTopicContent(topicId: string, content: string) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase
      .from("topics")
      .update({
        description: content,
      })
      .eq("id", topicId)

    if (error) {
      throw new Error("Failed to update topic content")
    }

    revalidatePath("/admin/content")
    return { success: true, message: "Topic content updated successfully" }
  } catch (error) {
    console.error("Error updating topic content:", error)
    return { success: false, message: "Failed to update topic content" }
  }
}

export async function getTopicContent(topicId: string) {
  const supabase = await createClient()

  try {
    const { data: topic, error } = await supabase
      .from("topics")
      .select("name, description")
      .eq("id", topicId)
      .single()

    if (error) {
      throw new Error("Failed to fetch topic content")
    }

    return topic
  } catch (error) {
    console.error("Error fetching topic content:", error)
    throw new Error("Failed to fetch topic content")
  }
}
// AI Rules management
export async function getAllAIRules() {
  const supabase = await createClient()

  try {
    const { data: aiRules, error } = await supabase
      .from("ai_rules")
      .select("*")
      .order("rule_type")

    if (error) {
      console.error("Error fetching AI rules:", error)
      return []
    }

    return aiRules || []
  } catch (error) {
    console.error("Error fetching AI rules:", error)
    return []
  }
}

export async function toggleAIRule(ruleId: string, ruleType: string) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    // Get current status
    const { data: rule, error: fetchError } = await supabase
      .from("ai_rules")
      .select("is_active")
      .eq("id", ruleId)
      .single()

    if (fetchError || !rule) {
      throw new Error("Rule not found")
    }

    // Toggle status
    const { error: updateError } = await supabase
      .from("ai_rules")
      .update({ is_active: !rule.is_active })
      .eq("id", ruleId)

    if (updateError) {
      throw new Error("Failed to update rule status")
    }

    revalidatePath("/admin/ai-rules")
    return { success: true, message: "Rule status updated successfully" }
  } catch (error) {
    console.error("Error toggling AI rule:", error)
    return { success: false, message: "Failed to update rule status" }
  }
}

export async function updateAIRule(ruleId: string, ruleType: string, name: string, description: string) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase
      .from("ai_rules")
      .update({
        title: name,
        description: description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ruleId)

    if (error) {
      throw new Error("Failed to update rule")
    }

    revalidatePath("/admin/ai-rules")
    return { success: true, message: "Rule updated successfully" }
  } catch (error) {
    console.error("Error updating AI rule:", error)
    return { success: false, message: "Failed to update rule" }
  }
}

export async function createAIRule(data: { ruleType: string; category: string; title: string; description: string }) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase.from("ai_rules").insert({
      rule_type: data.ruleType,
      category: data.category,
      title: data.title,
      description: data.description,
      is_active: true,
    })

    if (error) {
      throw new Error("Failed to create AI rule")
    }

    revalidatePath("/admin/ai-rules")
    return { success: true, message: "AI rule created successfully" }
  } catch (error) {
    console.error("Error creating AI rule:", error)
    return { success: false, message: "Failed to create AI rule" }
  }
}

export async function deleteAIRule(ruleId: string) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase.from("ai_rules").delete().eq("id", ruleId)

    if (error) {
      throw new Error("Failed to delete AI rule")
    }

    revalidatePath("/admin/ai-rules")
    return { success: true, message: "AI rule deleted successfully" }
  } catch (error) {
    console.error("Error deleting AI rule:", error)
    return { success: false, message: "Failed to delete AI rule" }
  }
}
// Bloom Samples management
export async function getAllBloomSamples() {
  const supabase = await createClient()

  try {
    const { data: bloomSamples, error } = await supabase
      .from("bloom_samples")
      .select("*")
      .order("bloom_level")

    if (error) {
      console.error("Error fetching bloom samples:", error)
      return []
    }

    return bloomSamples || []
  } catch (error) {
    console.error("Error fetching bloom samples:", error)
    return []
  }
}

export async function createBloomSample(bloomLevel: string, grade: string, subject: string, question: string) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase.from("bloom_samples").insert({
      bloom_level: bloomLevel,
      grade_level: parseInt(grade),
      subject: subject,
      question_type: "mcq",
      sample_question: question,
      explanation: `Sample ${bloomLevel} question for Grade ${grade} ${subject}`,
    })

    if (error) {
      throw new Error("Failed to create sample question")
    }

    revalidatePath("/admin/bloom-samples")
    return { success: true, message: "Sample question created successfully" }
  } catch (error) {
    console.error("Error creating bloom sample:", error)
    return { success: false, message: "Failed to create sample question" }
  }
}

export async function updateBloomSample(sampleId: string, bloomLevel: string, grade: string, subject: string, question: string) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase
      .from("bloom_samples")
      .update({
        bloom_level: bloomLevel,
        grade_level: parseInt(grade),
        subject: subject,
        sample_question: question,
        explanation: `Updated ${bloomLevel} question for Grade ${grade} ${subject}`,
      })
      .eq("id", sampleId)

    if (error) {
      throw new Error("Failed to update sample question")
    }

    revalidatePath("/admin/bloom-samples")
    return { success: true, message: "Sample question updated successfully" }
  } catch (error) {
    console.error("Error updating bloom sample:", error)
    return { success: false, message: "Failed to update sample question" }
  }
}

export async function deleteBloomSample(sampleId: string) {
  await requireAdminAuth()
  const supabase = await createAdminClient()

  try {
    const { error } = await supabase
      .from("bloom_samples")
      .delete()
      .eq("id", sampleId)

    if (error) {
      throw new Error("Failed to delete sample question")
    }

    revalidatePath("/admin/bloom-samples")
    return { success: true, message: "Sample question deleted successfully" }
  } catch (error) {
    console.error("Error deleting bloom sample:", error)
    return { success: false, message: "Failed to delete sample question" }
  }
}