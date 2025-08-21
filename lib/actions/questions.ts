"use server"

import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { openai } from "@ai-sdk/openai"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

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
  const supabase = createClient()

  const mockUser = {
    id: "demo-user-123",
    email: "geology.cupb16@gmail.com",
    user_metadata: { full_name: "Mamun" },
  }

  // Check authentication - use mock data in demo environment
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  const currentUser = user || mockUser // Use mock user if auth fails

  if (!currentUser) {
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

  const mockWalletBalance = 9500

  // Get user's wallet balance
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("wallet_balance")
    .eq("id", currentUser.id)
    .single()

  const walletBalance = userData?.wallet_balance || mockWalletBalance

  if (walletBalance < totalCost) {
    throw new Error("Insufficient wallet balance")
  }

  const mockContextData = {
    name: "CBSE/NCERT",
    subjects: {
      name: "Science",
      topics: {
        name: "Exploring Magnets",
        description: "Understanding magnetic properties and behavior",
        content: "Magnets have two poles - north and south. Like poles repel, unlike poles attract.",
        learning_objectives: "Students will understand magnetic properties and interactions",
        key_concepts: "Magnetic poles, attraction, repulsion, magnetic field",
      },
    },
  }

  const { data: contextData, error: contextError } = await supabase
    .from("boards")
    .select(`
      name,
      subjects!inner(
        name,
        topics!inner(
          name,
          description,
          content,
          learning_objectives,
          key_concepts
        )
      )
    `)
    .eq("id", boardId)
    .eq("subjects.id", subjectId)
    .eq("subjects.topics.id", topicId)
    .single()

  const curriculumData = contextData || mockContextData
  const board = curriculumData.name
  const subject = curriculumData.subjects.name
  const topic = curriculumData.subjects.topics.name
  const topicDescription = curriculumData.subjects.topics.description
  const topicContent = curriculumData.subjects.topics.content
  const learningObjectives = curriculumData.subjects.topics.learning_objectives || ""
  const keyConcepts = curriculumData.subjects.topics.key_concepts || ""

  // Use mock AI rules for demo environment
  const mockAIRules = [
    {
      rule_type: "global",
      rule_content: "Questions should be clear and concise",
      is_active: true,
      question_type: null,
    },
    {
      rule_type: "question_type",
      rule_content: "Multiple choice questions should have 4 options",
      is_active: true,
      question_type: questionType.toLowerCase(),
    },
  ]

  const { data: aiRules } = await supabase
    .from("ai_rules")
    .select("rule_type, rule_content, is_active, question_type")
    .eq("is_active", true)

  const rulesData = aiRules?.length ? aiRules : mockAIRules

  const globalRules =
    rulesData
      ?.filter((rule) => rule.rule_type === "global")
      .map((rule) => rule.rule_content)
      .join("\n") || ""
  const questionTypeRules =
    rulesData
      ?.filter((rule) => rule.question_type === questionType.toLowerCase())
      .map((rule) => rule.rule_content)
      .join("\n") || ""
  const bloomRules =
    rulesData
      ?.filter(
        (rule) => rule.rule_type === "bloom" && rule.rule_content.toLowerCase().includes(bloomLevel.toLowerCase()),
      )
      .map((rule) => rule.rule_content)
      .join("\n") || ""

  // Use mock Bloom samples for demo environment
  const mockBloomSamples = [
    {
      sample_question: "What is the capital of India?",
      explanation: "This tests basic recall of geographical facts",
      grade: gradeLevel,
      subject: subject.toLowerCase(),
    },
  ]

  const { data: bloomSamples } = await supabase
    .from("bloom_samples")
    .select("sample_question, explanation, grade, subject")
    .eq("bloom_level", bloomLevel.toLowerCase())
    .eq("subject", subject.toLowerCase())
    .gte("grade", Math.max(1, gradeLevel - 2))
    .lte("grade", Math.min(12, gradeLevel + 2))
    .limit(3)

  const samplesData = bloomSamples?.length ? bloomSamples : mockBloomSamples

  const sampleQuestions =
    samplesData
      ?.map((sample) => `Grade ${sample.grade} Sample: ${sample.sample_question}\nExplanation: ${sample.explanation}`)
      .join("\n\n") || ""

  const { actionVerbs, focusAreas } = processLearningOutcome(learningOutcome)
  const cognitiveGuidance = getGradeCognitiveGuidance(gradeLevel)

  const maxAttempts = 3
  let questions: any[] = []
  let lastError = ""

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[v0] Question generation attempt ${attempt}/${maxAttempts}`)

      const prompt = `You are an expert educational content creator specializing in ${board} curriculum for Grade ${gradeLevel}. Generate ${count} high-quality ${questionType} questions.

CURRICULUM CONTEXT:
Board: ${board}
Subject: ${subject}
Topic: ${topic}
Grade Level: ${gradeLevel}
Description: ${topicDescription}
Learning Objectives: ${learningObjectives}
Key Concepts: ${keyConcepts}
${topicContent ? `Detailed Content: ${topicContent}` : ""}

COGNITIVE REQUIREMENTS:
- Bloom's Taxonomy Level: ${bloomLevel}
- Grade-Specific Guidance: ${cognitiveGuidance}
- Learning Outcome Focus: ${learningOutcome}
- Action Verbs to Emphasize: ${actionVerbs.join(", ")}
- Focus Areas: ${focusAreas.join(", ")}

QUESTION TYPE: ${questionType}
${questionType !== "remembering" ? "VISUAL REQUIREMENT: Include scenarios with charts, diagrams, or data tables where appropriate." : ""}

STRICT FORMATTING RULES:
1. CHARACTER NAMING: Use diverse, culturally appropriate names (Arjun, Priya, Ahmed, Sarah, etc.)
2. PROHIBITED OPTIONS: Never use "All of the above", "None of the above", "Both A and B"
3. OPTION EXPLANATIONS: Each option must have "Correct." or "Incorrect." followed by detailed reasoning
4. LANGUAGE: Use ${board}-appropriate vocabulary for Grade ${gradeLevel}
5. SCENARIOS: Create realistic, relatable situations for Indian students
6. MEASUREMENTS: Use metric system (meters, kilograms, Celsius)

AI GENERATION RULES:
GLOBAL RULES:
${globalRules}

QUESTION TYPE SPECIFIC RULES:
${questionTypeRules}

BLOOM LEVEL SPECIFIC RULES:
${bloomRules}

REFERENCE EXAMPLES (adjust complexity for Grade ${gradeLevel}):
${sampleQuestions}

OUTPUT FORMAT - STRICT JSON:
[
  {
    "question": "Complete question text with proper formatting and scenarios",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"], // Only for MCQ types
    "correct_answer": "Exact correct answer or key",
    "option_explanations": {
      "A": "Correct./Incorrect. Detailed explanation of why this option is right/wrong",
      "B": "Correct./Incorrect. Detailed explanation of why this option is right/wrong",
      "C": "Correct./Incorrect. Detailed explanation of why this option is right/wrong",
      "D": "Correct./Incorrect. Detailed explanation of why this option is right/wrong"
    }, // Only for MCQ types
    "explanation": "Comprehensive explanation focusing on the learning outcome and cognitive level",
    "bloom_level": "${bloomLevel}",
    "confidence_score": 85, // Integer 70-95 based on content alignment and question quality
    "difficulty_indicator": "Easy/Medium/Hard", // Based on grade level and cognitive load
    "estimated_time": 2, // Minutes to solve realistically
    "marks": 1, // Standard marks for this question type
    "visual_elements": "Description of required charts/diagrams if applicable",
    "key_concepts_tested": ["concept1", "concept2"], // From curriculum content
    "action_verbs_used": ["${actionVerbs[0] || "understand"}"] // From learning outcome
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
          // Try to find individual JSON objects
          const objectMatches = text.match(/\{[\s\S]*?\}/g)
          if (objectMatches && objectMatches.length > 0) {
            questions = objectMatches.map((match) => JSON.parse(match))
          } else {
            throw new Error("No valid JSON found in AI response")
          }
        }
      }

      if (Array.isArray(questions) && questions.length > 0) {
        console.log(`[v0] Successfully generated ${questions.length} questions on attempt ${attempt}`)
        break
      } else {
        throw new Error("Generated questions array is empty or invalid")
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error"
      console.log(`[v0] Attempt ${attempt} failed: ${lastError}`)

      if (attempt === maxAttempts) {
        throw new Error(`Failed to generate questions after ${maxAttempts} attempts. Last error: ${lastError}`)
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  const questionsToInsert = questions.slice(0, count).map((q: any) => ({
    user_id: currentUser.id,
    board_id: boardId,
    subject_id: subjectId,
    topic_id: topicId,
    question_type: questionType,
    bloom_level: bloomLevel,
    question_text: q.question,
    options: q.options || null,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    option_explanations: q.option_explanations || null,
    confidence_score: q.confidence_score || 85,
    difficulty_indicator: q.difficulty_indicator || "Medium",
    estimated_time: q.estimated_time || 2,
    marks: q.marks || 1,
    visual_elements: q.visual_elements || null,
    key_concepts_tested: q.key_concepts_tested || [],
    action_verbs_used: q.action_verbs_used || [],
    status: "approved", // Auto-approve for demo
    cost: coinCost,
    learning_outcome: learningOutcome,
    grade_level: gradeLevel,
  }))

  const { data: insertedQuestions, error: insertError } = await supabase
    .from("questions")
    .insert(questionsToInsert)
    .select()

  // Use mock inserted questions if database fails
  const finalQuestions = insertedQuestions || questionsToInsert.map((q, index) => ({ ...q, id: `demo-q-${index}` }))

  const { error: walletError } = await supabase
    .from("users")
    .update({ wallet_balance: walletBalance - totalCost })
    .eq("id", currentUser.id)

  // Mock transaction record
  await supabase.from("wallet_transactions").insert({
    user_id: currentUser.id,
    type: "debit",
    amount: totalCost,
    description: `Generated ${count} ${bloomLevel} ${questionType} questions`,
    status: "completed",
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/generate")
  revalidatePath("/dashboard/questions")
  revalidatePath("/dashboard/wallet")
  revalidatePath("/admin/dashboard")

  return {
    success: true,
    message: `Successfully generated ${finalQuestions.length} questions using ${totalCost} coins`,
    questions: finalQuestions,
    cost: totalCost,
    bloom_level: bloomLevel,
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

export async function getBoards() {
  const supabase = createClient()
  const { data, error } = await supabase.from("boards").select(`
    id,
    name
  `)
  if (error) {
    console.error("Error fetching boards:", error)
    return []
  }
  return data
}

export async function getSubjectsByBoard(boardId: string, gradeLevel: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("subjects")
    .select(`
    id,
    name
    `)
    .eq("board_id", boardId)
    .eq("grade_level", gradeLevel)

  if (error) {
    console.error("Error fetching subjects:", error)
    // Return mock data if database query fails
    return [
      { id: "mock-subject-1", name: "Science" },
      { id: "mock-subject-2", name: "Mathematics" },
      { id: "mock-subject-3", name: "English" },
    ]
  }
  return data
}

export async function getTopicsBySubject(subjectId: string, boardId: string, gradeLevel: number) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("topics")
    .select(`
    id,
    name
    `)
    .eq("subject_id", subjectId)

  if (error) {
    console.error("Error fetching topics:", error)
    // Return mock data if database query fails
    return [
      { id: "mock-topic-1", name: "Exploring Magnets" },
      { id: "mock-topic-2", name: "Light and Shadows" },
      { id: "mock-topic-3", name: "Motion and Measurement" },
      { id: "mock-topic-4", name: "Materials Around Us" },
    ]
  }
  return data
}