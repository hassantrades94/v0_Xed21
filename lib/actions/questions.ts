"use server"

import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function generateQuestions(formData: FormData) {
  const supabase = createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get form data
  const boardId = formData.get("board_id") as string
  const subjectId = formData.get("subject_id") as string
  const topicId = formData.get("topic_id") as string
  const questionType = formData.get("question_type") as string
  const difficulty = formData.get("difficulty") as string
  const count = Number.parseInt(formData.get("count") as string)
  const customPrompt = formData.get("custom_prompt") as string

  if (!boardId || !subjectId || !topicId || !questionType || !difficulty || !count) {
    throw new Error("Missing required fields")
  }

  // Get user's wallet balance
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("wallet_balance")
    .eq("id", user.id)
    .single()

  if (userError || !userData) {
    throw new Error("Failed to fetch user data")
  }

  // Calculate cost (5 coins per question)
  const totalCost = count * 5
  if (userData.wallet_balance < totalCost) {
    throw new Error("Insufficient wallet balance")
  }

  // Get curriculum context
  const { data: contextData, error: contextError } = await supabase
    .from("boards")
    .select(`
      name,
      subjects!inner(
        name,
        topics!inner(
          name,
          description
        )
      )
    `)
    .eq("id", boardId)
    .eq("subjects.id", subjectId)
    .eq("subjects.topics.id", topicId)
    .single()

  if (contextError || !contextData) {
    throw new Error("Failed to fetch curriculum context")
  }

  const board = contextData.name
  const subject = contextData.subjects.name
  const topic = contextData.subjects.topics.name
  const topicDescription = contextData.subjects.topics.description

  // Generate questions using AI
  const prompt = `Generate ${count} ${questionType} questions for ${board} curriculum.

Subject: ${subject}
Topic: ${topic}
Topic Description: ${topicDescription}
Difficulty Level: ${difficulty}
Question Type: ${questionType}

${customPrompt ? `Additional Requirements: ${customPrompt}` : ""}

Requirements:
1. Questions must be curriculum-aligned and pedagogically sound
2. Include proper answer explanations
3. Use age-appropriate language
4. Follow Bloom's Taxonomy for cognitive levels
5. Include marking scheme for subjective questions

Format each question as JSON with:
{
  "question": "Question text",
  "options": ["A", "B", "C", "D"] (for MCQ only),
  "correct_answer": "Answer",
  "explanation": "Detailed explanation",
  "marks": number,
  "cognitive_level": "Remember/Understand/Apply/Analyze/Evaluate/Create"
}

Return as JSON array of questions.`

  try {
    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      prompt,
      maxTokens: 4000,
    })

    // Parse AI response
    let questions
    try {
      questions = JSON.parse(text)
    } catch {
      // If direct parsing fails, try to extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Invalid AI response format")
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("No questions generated")
    }

    // Store questions in database
    const questionsToInsert = questions.map((q: any) => ({
      user_id: user.id,
      board_id: boardId,
      subject_id: subjectId,
      topic_id: topicId,
      question_type: questionType,
      difficulty_level: difficulty,
      question_text: q.question,
      options: q.options || null,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      marks: q.marks || 1,
      cognitive_level: q.cognitive_level || "Remember",
      status: "pending_approval",
      cost: 5,
    }))

    const { data: insertedQuestions, error: insertError } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select()

    if (insertError) {
      throw new Error("Failed to save questions")
    }

    // Deduct coins from wallet
    const { error: walletError } = await supabase
      .from("users")
      .update({ wallet_balance: userData.wallet_balance - totalCost })
      .eq("id", user.id)

    if (walletError) {
      throw new Error("Failed to update wallet balance")
    }

    // Record transaction
    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "debit",
      amount: totalCost,
      description: `Generated ${count} ${questionType} questions`,
      status: "completed",
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/generate")
    revalidatePath("/dashboard/questions")
    revalidatePath("/dashboard/wallet")

    return {
      success: true,
      message: `Successfully generated ${insertedQuestions.length} questions`,
      questions: insertedQuestions,
    }
  } catch (error) {
    console.error("Question generation error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to generate questions")
  }
}

export async function approveQuestion(questionId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("questions").update({ status: "approved" }).eq("id", questionId)

  if (error) {
    throw new Error("Failed to approve question")
  }

  revalidatePath("/admin/questions")
  return { success: true }
}

export async function rejectQuestion(questionId: string, reason?: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from("questions")
    .update({
      status: "rejected",
      rejection_reason: reason,
    })
    .eq("id", questionId)

  if (error) {
    throw new Error("Failed to reject question")
  }

  revalidatePath("/admin/questions")
  return { success: true }
}
