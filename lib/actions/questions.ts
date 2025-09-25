"use server"

import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { openai } from "@ai-sdk/openai"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/supabase/types"

type Board = Database['public']['Tables']['boards']['Row']
type Subject = Database['public']['Tables']['subjects']['Row']
type Topic = Database['public']['Tables']['topics']['Row']

interface AIProvider {
  name: "groq" | "openrouter"
  model: string
  apiKey?: string
  baseURL?: string
}

const getAIProvider = (): AIProvider => {
  const provider = process.env.AI_PROVIDER || "groq"

  if (provider === "openrouter") {
    return {
      name: "openrouter",
      model: "openai/gpt-4o-mini",
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    }
  }

  return {
    name: "groq",
    model: "llama-3.1-70b-versatile",
  }
}

const getGradeCognitiveGuidance = (grade: number): string => {
  if (grade <= 2)
    return "Use simple vocabulary, concrete examples, and basic concepts. Focus on recognition and recall."
  if (grade <= 5)
    return "Use age-appropriate language with some abstract concepts. Include relatable examples and scenarios."
  if (grade <= 8) return "Introduce more complex reasoning. Use varied vocabulary and multi-step problems."
  if (grade <= 10)
    return "Include analytical thinking and application of concepts. Use academic language appropriately."
  return "Use sophisticated vocabulary and complex reasoning. Include critical thinking and evaluation skills."
}

const processLearningOutcome = (outcome: string): { actionVerbs: string[]; focusAreas: string[] } => {
  const actionVerbs =
    outcome.match(
      /\b(identify|explain|analyze|evaluate|create|apply|understand|remember|compare|contrast|describe|demonstrate|solve|calculate|interpret|synthesize)\b/gi,
    ) || []
  const focusAreas = outcome
    .split(",")
    .map((area) => area.trim())
    .filter((area) => area.length > 0)
  return { actionVerbs: [...new Set(actionVerbs.map((v) => v.toLowerCase()))], focusAreas }
}

export async function generateQuestions(formData: FormData) {
  const supabase = await createClient()

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
  const bloomLevel = formData.get("bloom_level") as string
  const count = Number.parseInt(formData.get("count") as string)
  const learningOutcome = formData.get("learning_outcome") as string
  const gradeLevel = Number.parseInt(formData.get("grade") as string) || 6

  if (!boardId || !subjectId || !topicId || !questionType || !bloomLevel || !count) {
    throw new Error("Missing required fields")
  }

  const bloomCosts = {
    remembering: 5,
    understanding: 7,
    applying: 10,
    analyzing: 15,
    evaluating: 25,
    creating: 25,
  }

  const coinCost = bloomCosts[bloomLevel.toLowerCase() as keyof typeof bloomCosts] || 7
  const totalCost = count * coinCost

  // Get user's wallet balance
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("wallet_balance")
    .eq("id", user.id)
    .single()

  if (userError || !userData) {
    throw new Error("User not found")
  }

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
    throw new Error("Failed to load curriculum context")
  }

  const board = contextData.name
  const subject = contextData.subjects.name
  const topic = contextData.subjects.topics.name
  const topicDescription = contextData.subjects.topics.description

  // Get AI rules
  const { data: aiRules } = await supabase
    .from("ai_rules")
    .select("rule_type, description, is_active")
    .eq("is_active", true)

  const globalRules =
    aiRules
      ?.filter((rule) => rule.rule_type === "global")
      .map((rule) => rule.description)
      .join("\n") || ""

  // Get Bloom samples
  const { data: bloomSamples } = await supabase
    .from("bloom_samples")
    .select("sample_question, explanation, grade_level, subject")
    .eq("bloom_level", bloomLevel.toLowerCase())
    .eq("subject", subject.toLowerCase())
    .gte("grade_level", Math.max(1, gradeLevel - 2))
    .lte("grade_level", Math.min(12, gradeLevel + 2))
    .limit(3)

  const sampleQuestions =
    bloomSamples
      ?.map((sample) => `Grade ${sample.grade_level} Sample: ${sample.sample_question}\nExplanation: ${sample.explanation}`)
      .join("\n\n") || ""

  const { actionVerbs, focusAreas } = processLearningOutcome(learningOutcome)
  const cognitiveGuidance = getGradeCognitiveGuidance(gradeLevel)

  const maxAttempts = 3
  let questions: any[] = []
  let lastError = ""

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Question generation attempt ${attempt}/${maxAttempts}`)

      const prompt = `You are an expert educational content creator specializing in ${board} curriculum for Grade ${gradeLevel}. Generate ${count} high-quality ${questionType} questions.

CURRICULUM CONTEXT:
Board: ${board}
Subject: ${subject}
Topic: ${topic}
Grade Level: ${gradeLevel}
Description: ${topicDescription}
Learning Outcome Focus: ${learningOutcome}
Action Verbs to Emphasize: ${actionVerbs.join(", ")}
Focus Areas: ${focusAreas.join(", ")}

COGNITIVE REQUIREMENTS:
- Bloom's Taxonomy Level: ${bloomLevel}
- Grade-Specific Guidance: ${cognitiveGuidance}

QUESTION TYPE: ${questionType}

STRICT FORMATTING RULES:
1. CHARACTER NAMING: Use diverse, culturally appropriate names (Arjun, Priya, Ahmed, Sarah, etc.)
2. PROHIBITED OPTIONS: Never use "All of the above", "None of the above", "Both A and B"
3. OPTION EXPLANATIONS: Each option must have "Correct." or "Incorrect." followed by detailed reasoning
4. LANGUAGE: Use ${board}-appropriate vocabulary for Grade ${gradeLevel}
5. SCENARIOS: Create realistic, relatable situations for Indian students
6. MEASUREMENTS: Use metric system (meters, kilograms, Celsius)

AI GENERATION RULES:
${globalRules}

REFERENCE EXAMPLES (adjust complexity for Grade ${gradeLevel}):
${sampleQuestions}

OUTPUT FORMAT - STRICT JSON:
[
  {
    "question": "Complete question text with proper formatting and scenarios",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correct_answer": "A",
    "option_explanations": {
      "A": "Correct. Detailed explanation of why this option is right",
      "B": "Incorrect. Detailed explanation of why this option is wrong",
      "C": "Incorrect. Detailed explanation of why this option is wrong",
      "D": "Incorrect. Detailed explanation of why this option is wrong"
    },
    "explanation": "Comprehensive explanation focusing on the learning outcome and cognitive level",
    "bloom_level": "${bloomLevel}",
    "confidence_score": 85,
    "difficulty_indicator": "Medium",
    "estimated_time": 2,
    "marks": 1
  }
]

CRITICAL: Generate exactly ${count} questions. Ensure each question tests different aspects of the topic while maintaining curriculum alignment and cognitive level consistency.`

      const aiProvider = getAIProvider()
      let aiModel

      if (aiProvider.name === "openrouter") {
        aiModel = openai(aiProvider.model, {
          apiKey: aiProvider.apiKey,
          baseURL: aiProvider.baseURL,
        })
      } else {
        aiModel = groq(aiProvider.model)
      }

      const { text } = await generateText({
        model: aiModel,
        prompt,
        maxTokens: 6000,
        temperature: 0.7,
      })

      try {
        // Try direct parsing first
        questions = JSON.parse(text)
      } catch {
        // Extract JSON array from response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0])
        } else {
          throw new Error("No valid JSON found in AI response")
        }
      }

      if (Array.isArray(questions) && questions.length > 0) {
        console.log(`Successfully generated ${questions.length} questions on attempt ${attempt}`)
        break
      } else {
        throw new Error("Generated questions array is empty or invalid")
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error"
      console.log(`Attempt ${attempt} failed: ${lastError}`)

      if (attempt === maxAttempts) {
        throw new Error(`Failed to generate questions after ${maxAttempts} attempts. Last error: ${lastError}`)
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  // Insert questions into database
  const questionsToInsert = questions.slice(0, count).map((q: any) => ({
    user_id: user.id,
    topic_id: topicId,
    question_text: q.question,
    question_type: questionType as Database['public']['Enums']['question_type'],
    difficulty_level: (q.difficulty_indicator?.toLowerCase() || "medium") as Database['public']['Enums']['difficulty_level'],
    options: q.options || null,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    bloom_taxonomy_level: q.bloom_level,
    estimated_time_minutes: q.estimated_time || 2,
    is_approved: true, // Auto-approve for demo
  }))

  const { data: insertedQuestions, error: insertError } = await supabase
    .from("questions")
    .insert(questionsToInsert)
    .select()

  if (insertError) {
    console.error("Error inserting questions:", insertError)
    // Continue with mock data for demo
  }

  // Update wallet balance
  const { error: walletError } = await supabase
    .from("users")
    .update({ wallet_balance: userData.wallet_balance - totalCost })
    .eq("id", user.id)

  if (walletError) {
    console.error("Error updating wallet:", walletError)
  }

  // Record transaction
  const { error: transactionError } = await supabase.from("wallet_transactions").insert({
    user_id: user.id,
    transaction_type: "debit",
    amount: totalCost,
    description: `Generated ${count} ${bloomLevel} ${questionType} questions`,
    status: "completed",
    balance_after: userData.wallet_balance - totalCost,
  })

  if (transactionError) {
    console.error("Error recording transaction:", transactionError)
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/generate")
  revalidatePath("/dashboard/questions")
  revalidatePath("/dashboard/wallet")
  revalidatePath("/admin/dashboard")

  return {
    success: true,
    message: `Successfully generated ${count} questions using ${totalCost} coins`,
    questions: insertedQuestions || questionsToInsert,
    cost: totalCost,
    bloom_level: bloomLevel,
  }
}

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
    console.error("Error in getBoards:", error)
    return []
  }
}

export async function getSubjectsByBoard(boardId: string, gradeLevel: number): Promise<Subject[]> {
  const supabase = await createClient()

  try {
    const { data: subjects, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("board_id", boardId)
      .eq("grade_level", gradeLevel)
      .order("name")

    if (error) {
      console.error("Error fetching subjects:", error)
      return []
    }

    return subjects || []
  } catch (error) {
    console.error("Error in getSubjectsByBoard:", error)
    return []
  }
}

export async function getTopicsBySubject(subjectId: string, boardId: string, gradeLevel: number): Promise<Topic[]> {
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
    console.error("Error in getTopicsBySubject:", error)
    return []
  }
}

export async function approveQuestion(questionId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("questions")
    .update({ is_approved: true })
    .eq("id", questionId)

  if (error) {
    throw new Error("Failed to approve question")
  }

  revalidatePath("/admin/questions")
  return { success: true }
}

export async function rejectQuestion(questionId: string, reason?: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("questions")
    .update({
      is_approved: false,
      // Note: rejection_reason field would need to be added to schema
    })
    .eq("id", questionId)

  if (error) {
    throw new Error("Failed to reject question")
  }

  revalidatePath("/admin/questions")
  return { success: true }
}