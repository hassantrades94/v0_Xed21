"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserCoins(userId: string, newBalance: number) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("users").update({ wallet_balance: newBalance }).eq("id", userId)

    if (error) throw error

    // Record transaction
    await supabase.from("wallet_transactions").insert({
      user_id: userId,
      type: "admin_adjustment",
      amount: newBalance,
      description: "Admin coin balance adjustment",
      status: "completed",
    })

    revalidatePath("/admin/users")
    return { success: true, message: "User coins updated successfully" }
  } catch (error) {
    console.error("[v0] Error updating user coins:", error)
    return { success: false, message: "Failed to update user coins" }
  }
}

export async function suspendUser(userId: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("users").update({ status: "suspended" }).eq("id", userId)

    if (error) throw error

    revalidatePath("/admin/users")
    return { success: true, message: "User suspended successfully" }
  } catch (error) {
    console.error("[v0] Error suspending user:", error)
    return { success: false, message: "Failed to suspend user" }
  }
}

export async function deleteUser(userId: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) throw error

    revalidatePath("/admin/users")
    return { success: true, message: "User deleted successfully" }
  } catch (error) {
    console.error("[v0] Error deleting user:", error)
    return { success: false, message: "Failed to delete user" }
  }
}

export async function updateContentItem(contentId: string, title: string, content: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from("topics")
      .update({
        name: title,
        content: content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contentId)

    if (error) throw error

    revalidatePath("/admin/content")
    return { success: true, message: "Content updated successfully" }
  } catch (error) {
    console.error("[v0] Error updating content:", error)
    return { success: false, message: "Failed to update content" }
  }
}

export async function uploadContentFile(formData: FormData) {
  try {
    const file = formData.get("file") as File
    console.log(`[v0] Processing uploaded file: ${file?.name}`)

    // Mock AI content extraction - in real implementation would use AI to extract content
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const extractedContent = `Extracted content from ${file?.name}:\n\nThis is AI-generated content based on the uploaded file. The system has analyzed the document and extracted key educational concepts, definitions, and learning objectives that can be used for question generation.`

    revalidatePath("/admin/content")
    return { success: true, message: "File processed and content extracted", content: extractedContent }
  } catch (error) {
    console.error("[v0] Error processing file:", error)
    return { success: false, message: "Failed to process uploaded file" }
  }
}

export async function toggleAIRule(ruleId: string, ruleType: string) {
  try {
    const supabase = createClient()

    // Get current status
    const { data: currentRule, error: fetchError } = await supabase
      .from("ai_rules")
      .select("is_active")
      .eq("id", ruleId)
      .single()

    if (fetchError) throw fetchError

    // Toggle status
    const { error } = await supabase.from("ai_rules").update({ is_active: !currentRule.is_active }).eq("id", ruleId)

    if (error) throw error

    revalidatePath("/admin/ai-rules")
    return { success: true, message: "Rule status updated successfully" }
  } catch (error) {
    console.error("[v0] Error toggling rule:", error)
    return { success: false, message: "Failed to update rule status" }
  }
}

export async function updateAIRule(ruleId: string, ruleType: string, name: string, description: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from("ai_rules")
      .update({
        rule_name: name,
        rule_content: description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ruleId)

    if (error) throw error

    revalidatePath("/admin/ai-rules")
    return { success: true, message: "Rule updated successfully" }
  } catch (error) {
    console.error("[v0] Error updating rule:", error)
    return { success: false, message: "Failed to update rule" }
  }
}

export async function createBloomSample(bloomLevel: string, grade: string, subject: string, question: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("bloom_samples").insert({
      bloom_level: bloomLevel.toLowerCase(),
      grade: Number.parseInt(grade),
      subject: subject.toLowerCase(),
      sample_question: question,
      explanation: `Sample ${bloomLevel} level question for Grade ${grade} ${subject}`,
      status: "active",
    })

    if (error) throw error

    revalidatePath("/admin/bloom-samples")
    return { success: true, message: "Sample question created successfully" }
  } catch (error) {
    console.error("[v0] Error creating sample:", error)
    return { success: false, message: "Failed to create sample question" }
  }
}

export async function updateBloomSample(
  sampleId: string,
  bloomLevel: string,
  grade: string,
  subject: string,
  question: string,
) {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from("bloom_samples")
      .update({
        bloom_level: bloomLevel.toLowerCase(),
        grade: Number.parseInt(grade),
        subject: subject.toLowerCase(),
        sample_question: question,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sampleId)

    if (error) throw error

    revalidatePath("/admin/bloom-samples")
    return { success: true, message: "Sample question updated successfully" }
  } catch (error) {
    console.error("[v0] Error updating sample:", error)
    return { success: false, message: "Failed to update sample question" }
  }
}

export async function deleteBloomSample(sampleId: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("bloom_samples").delete().eq("id", sampleId)

    if (error) throw error

    revalidatePath("/admin/bloom-samples")
    return { success: true, message: "Sample question deleted successfully" }
  } catch (error) {
    console.error("[v0] Error deleting sample:", error)
    return { success: false, message: "Failed to delete sample question" }
  }
}

export async function createAIRule(ruleType: string, name: string, description: string, questionType?: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("ai_rules").insert({
      rule_type: ruleType,
      rule_name: name,
      rule_content: description,
      question_type: questionType?.toLowerCase(),
      is_active: true,
    })

    if (error) throw error

    revalidatePath("/admin/ai-rules")
    return { success: true, message: "AI rule created successfully" }
  } catch (error) {
    console.error("[v0] Error creating AI rule:", error)
    return { success: false, message: "Failed to create AI rule" }
  }
}

export async function deleteAIRule(ruleId: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("ai_rules").delete().eq("id", ruleId)

    if (error) throw error

    revalidatePath("/admin/ai-rules")
    return { success: true, message: "AI rule deleted successfully" }
  } catch (error) {
    console.error("[v0] Error deleting AI rule:", error)
    return { success: false, message: "Failed to delete AI rule" }
  }
}
