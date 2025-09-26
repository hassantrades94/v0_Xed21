"use client"

import type React from "react"
import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Zap, Coins, Eye, EyeOff } from "lucide-react"
import { generateQuestions, getSubjectsByBoard, getTopicsBySubject } from "@/lib/actions/questions"
import { toast } from "@/components/ui/sonner"

interface QuestionGeneratorProps {
  userProfile: any
  boards: any[]
}

const bloomLevels = {
  remembering: { label: "Remembering", coins: 5 },
  understanding: { label: "Understanding", coins: 7 },
  applying: { label: "Applying", coins: 10 },
  analyzing: { label: "Analyzing", coins: 15 },
  evaluating: { label: "Evaluating", coins: 25 },
  creating: { label: "Creating", coins: 25 },
}

const questionTypes = {
  mcq_single: "Multiple Choice (Single correct)",
  mcq_multiple: "Multiple Select (More than one correct answer)",
  fill_blank: "Fill in the Blanks",
  inline_choice: "In-Line Choice",
  matching: "Matching",
  true_false: "True/False",
}

const questionSamples = {
  mcq_single: {
    title: "Multiple Choice (Single correct)",
    description: "Select one correct answer from multiple options",
    example: {
      question: "What is the capital of India?",
      options: ["A) Chennai", "B) Kolkata", "C) Mumbai", "D) New Delhi"],
      key: "D",
      explanations: [
        { option: "A", text: "Incorrect. Major city in South India, but not the capital" },
        { option: "B", text: "Incorrect. Former capital during British rule, now capital of West Bengal" },
        { option: "C", text: "Incorrect. Commercial capital, but not political capital" },
        { option: "D", text: "Correct. Official capital and seat of the Indian government" },
      ],
    },
  },
  mcq_multiple: {
    title: "Multiple Select (More than one correct answer)",
    description: "Select all correct answers from the options (2-4 correct out of 6)",
    example: {
      question: "Which of the following are prime numbers?",
      options: ["A) 2", "B) 4", "C) 3", "D) 6", "E) 5", "F) 9"],
      key: "A, C, E",
      explanations: [
        { option: "A", text: "Correct. Smallest prime number, only even prime" },
        { option: "B", text: "Incorrect. Composite number, divisible by 2" },
        { option: "C", text: "Correct. Prime number, divisible only by 1 and 3" },
        { option: "D", text: "Incorrect. Composite number, divisible by 2 and 3" },
        { option: "E", text: "Correct. Prime number, divisible only by 1 and 5" },
        { option: "F", text: "Incorrect. Composite number, 3 × 3" },
      ],
    },
  },
  fill_blank: {
    title: "Fill in the Blanks",
    description: "Complete the sentence with appropriate words",
    example: {
      question: "The _____ is the largest planet in our solar system.",
      key: "Jupiter",
      explanation: "Jupiter is the largest planet by both mass and volume in our solar system.",
    },
  },
  inline_choice: {
    title: "In-Line Choice",
    description: "Select the correct option within the sentence",
    example: {
      question: "Water boils at [90°C/100°C/110°C] at sea level.",
      key: "100°C",
      explanation: "At standard atmospheric pressure (sea level), water boils at exactly 100°C or 212°F.",
    },
  },
  matching: {
    title: "Matching",
    description: "Match items from two columns",
    example: {
      question: "Match the countries with their capitals:",
      items: ["1. Brazil A. New Delhi", "2. France B. Tokyo", "3. India C. Brasília", "4. Japan D. Paris"],
      key: "1-C, 2-D, 3-A, 4-B",
      explanation: "Each country paired with its respective capital city.",
    },
  },
  true_false: {
    title: "True/False",
    description: "Determine if the statement is correct",
    example: {
      question: "The Earth revolves around the Sun.",
      options: ["A) True", "B) False"],
      key: "A",
      explanations: [
        { option: "A", text: "Correct. Earth orbits the Sun in an elliptical path" },
        { option: "B", text: "Incorrect. This would be the geocentric model" },
      ],
    },
  },
}

export default function QuestionGenerator({ userProfile, boards: initialBoards }: QuestionGeneratorProps) {
  const [formData, setFormData] = useState({
    boardId: "",
    grade: "",
    subjectId: "",
    topicId: "",
    learningOutcome: "",
    questionType: "mcq_single",
    bloomTaxonomy: "understanding",
    questionCount: "5",
  })
  const [isPending, startTransition] = useTransition()
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])
  const [showGenerated, setShowGenerated] = useState(false)
  const [showConfidence, setShowConfidence] = useState(true)

  const [subjects, setSubjects] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [loadingTopics, setLoadingTopics] = useState(false)

  useEffect(() => {
    if (formData.boardId && formData.grade) {
      setLoadingSubjects(true)
      getSubjectsByBoard(formData.boardId, Number.parseInt(formData.grade))
        .then((data) => {
          setSubjects(data || [])
        })
        .catch((error) => {
          console.error("Error loading subjects:", error)
          toast.error("Failed to load subjects")
        })
        .finally(() => {
          setLoadingSubjects(false)
        })
    } else {
      setSubjects([])
      setTopics([])
    }
  }, [formData.boardId, formData.grade])

  useEffect(() => {
    if (formData.subjectId) {
      setLoadingTopics(true)
      getTopicsBySubject(formData.subjectId, formData.boardId, Number.parseInt(formData.grade))
        .then((data) => {
          setTopics(data || [])
        })
        .catch((error) => {
          console.error("Error loading topics:", error)
          toast.error("Failed to load topics")
        })
        .finally(() => {
          setLoadingTopics(false)
        })
    } else {
      setTopics([])
    }
  }, [formData.subjectId])

  const costPerQuestion = bloomLevels[formData.bloomTaxonomy as keyof typeof bloomLevels]?.coins || 7
  const totalCost = Number.parseInt(formData.questionCount || "0") * costPerQuestion
  const canAfford = userProfile?.wallet_balance >= totalCost

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canAfford) {
      toast.error("Insufficient wallet balance. Please add funds to continue.")
      return
    }

    const formDataObj = new FormData()
    formDataObj.append("board_id", formData.boardId)
    formDataObj.append("grade", formData.grade)
    formDataObj.append("subject_id", formData.subjectId)
    formDataObj.append("topic_id", formData.topicId)
    formDataObj.append("learning_outcome", formData.learningOutcome)
    formDataObj.append("question_type", formData.questionType)
    formDataObj.append("bloom_level", formData.bloomTaxonomy)
    formDataObj.append("count", formData.questionCount)

    startTransition(async () => {
      try {
        const result = await generateQuestions(formDataObj)
        
        if (result.success && result.questions) {
          // Use real generated questions from database
          const formattedQuestions = result.questions.map((q: any, index: number) => ({
            id: q.id || index + 1,
            type: q.question_type || formData.questionType,
            question: q.question_text,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            explanations: q.option_explanations || [],
            bloom_level: q.bloom_taxonomy_level || formData.bloomTaxonomy,
            confidence_score: q.confidence_score || 85,
            difficulty_indicator: q.difficulty_level || "Medium",
            estimated_time: q.estimated_time_minutes || 2,
            marks: 1,
          }))
          
          setGeneratedQuestions(formattedQuestions)
          toast.success(result.message)
        } else {
          throw new Error(result.message || "Failed to generate questions")
        }
        setShowGenerated(true)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to generate questions")
      }
    })
  }

  const handleBackToForm = () => {
    setShowGenerated(false)
    setGeneratedQuestions([])
  }

  const handleDeleteQuestion = (questionId: number) => {
    setGeneratedQuestions((prev) => prev.filter((q) => q.id !== questionId))
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "boardId") {
      setFormData((prev) => ({ ...prev, subjectId: "", topicId: "" }))
    } else if (field === "subjectId") {
      setFormData((prev) => ({ ...prev, topicId: "" }))
    }
  }

  const currentSample = questionSamples[formData.questionType as keyof typeof questionSamples]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {!showGenerated ? (
            <>
              <div className="flex items-center space-x-2 mb-6">
                <Zap className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Generate Assessment Questions</h2>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="board" className="text-sm font-medium text-gray-700">
                      Board <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.boardId} onValueChange={(value) => updateFormData("boardId", value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select board" />
                      </SelectTrigger>
                      <SelectContent>
                        {initialBoards.map((board) => (
                          <SelectItem key={board.id} value={board.id}>
                            {board.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-sm font-medium text-gray-700">
                      Grade <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.grade} onValueChange={(value) => updateFormData("grade", value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Grade {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.subjectId}
                      onValueChange={(value) => updateFormData("subjectId", value)}
                      disabled={!formData.boardId || !formData.grade || loadingSubjects}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue
                          placeholder={
                            !formData.boardId || !formData.grade
                              ? "Select board and grade first"
                              : loadingSubjects
                                ? "Loading subjects..."
                                : "Select Subject"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-sm font-medium text-gray-700">
                      Topic/Chapter <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.topicId}
                      onValueChange={(value) => updateFormData("topicId", value)}
                      disabled={!formData.subjectId || loadingTopics}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue
                          placeholder={
                            !formData.subjectId
                              ? "Select subject first"
                              : loadingTopics
                                ? "Loading topics..."
                                : "Select Topic/Chapter"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learningOutcome" className="text-sm font-medium text-gray-700">
                    Learning Outcome/Standard (Optional)
                  </Label>
                  <Textarea
                    id="learningOutcome"
                    placeholder="e.g., Support an argument that the apparent brightness of the sun and stars is due to their relative distances from the Earth"
                    value={formData.learningOutcome}
                    onChange={(e) => updateFormData("learningOutcome", e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    If provided, questions will focus on the key verbs and learning objectives. For example, "support
                    argument" will generate questions about supporting arguments.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="questionType" className="text-sm font-medium text-gray-700">
                      Question Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.questionType}
                      onValueChange={(value) => updateFormData("questionType", value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(questionTypes).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloomTaxonomy" className="text-sm font-medium text-gray-700">
                      Bloom's Taxonomy Level <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.bloomTaxonomy}
                      onValueChange={(value) => updateFormData("bloomTaxonomy", value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(bloomLevels).map(([key, { label, coins }]) => (
                          <SelectItem key={key} value={key}>
                            {label} - {coins} coins
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionCount" className="text-sm font-medium text-gray-700">
                    Number of Questions <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.questionCount}
                    onValueChange={(value) => updateFormData("questionCount", value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Sample Preview:</h3>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{currentSample.title}</p>
                    <p className="text-gray-600 mb-2">{currentSample.description}</p>

                    <div className="bg-white p-3 rounded border text-xs font-mono">
                      <p className="mb-2">{currentSample.example.question}</p>

                      {currentSample.example.options &&
                        currentSample.example.options.map((option, index) => <p key={index}>{option}</p>)}

                      {currentSample.example.items &&
                        currentSample.example.items.map((item, index) => <p key={index}>{item}</p>)}

                      <p className="mt-2 text-blue-600">Key: {currentSample.example.key}</p>

                      {currentSample.example.explanation && (
                        <div className="mt-2 text-gray-600">
                          <p>
                            <strong>Explanation:</strong> {currentSample.example.explanation}
                          </p>
                        </div>
                      )}

                      {currentSample.example.explanations && (
                        <div className="mt-2 text-gray-600">
                          <p>
                            <strong>Explanations:</strong>
                          </p>
                          {currentSample.example.explanations.map((exp, index) => (
                            <p key={index}>
                              <strong>Explanation for {exp.option}:</strong> {exp.text}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Total Cost</p>
                      <p className="text-xs text-gray-600">
                        {costPerQuestion} coins × {formData.questionCount} questions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{totalCost}</p>
                    <p className="text-xs text-gray-600">coins</p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium"
                  disabled={isPending || !formData.topicId || !canAfford}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    `Generate Questions (Use ${totalCost} coins)`
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Generated Questions</h2>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="confidence-toggle" className="text-sm text-gray-600">
                      {showConfidence ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Label>
                    <Switch id="confidence-toggle" checked={showConfidence} onCheckedChange={setShowConfidence} />
                    <span className="text-sm text-gray-600">Confidence</span>
                  </div>
                  <Button variant="outline" className="text-sm bg-transparent">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Export
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleBackToForm} className="text-sm bg-transparent">
                    Back to Form
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {generatedQuestions.map((question) => (
                  <div key={question.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-blue-600 font-medium">Question {question.id}</span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {questionTypes[question.type as keyof typeof questionTypes]}
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {question.difficulty_indicator}
                        </span>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                          {question.estimated_time} min
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-900 leading-relaxed">{question.question}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      {question.options.map((option: string, index: number) => (
                        <p
                          key={index}
                          className={`text-gray-700 ${option.startsWith(question.correct_answer) ? "bg-green-50 p-2 rounded" : ""}`}
                        >
                          {option}
                        </p>
                      ))}
                    </div>

                    <div className="bg-green-50 p-3 rounded mb-4">
                      <p className="text-green-800 font-medium">Key: {question.correct_answer}</p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded mb-4">
                      <p className="text-blue-800 font-medium mb-2">Main Explanation:</p>
                      <p className="text-blue-700 text-sm mb-3">{question.explanation}</p>

                      <p className="text-blue-800 font-medium mb-2">Option Explanations:</p>
                      <div className="space-y-1 text-sm">
                        {question.explanations.map((exp: any, index: number) => (
                          <p key={index} className="text-blue-700">
                            <strong>Explanation for {exp.option}:</strong> {exp.text}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>
                          Bloom's Level: <span className="font-medium">{question.bloom_level}</span>
                        </span>
                        <span>
                          Marks: <span className="font-medium">{question.marks}</span>
                        </span>
                      </div>
                      {showConfidence && (
                        <div className="flex items-center space-x-2">
                          <span>Confidence:</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${question.confidence_score}%` }}
                            ></div>
                          </div>
                          <span>{question.confidence_score}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!showGenerated && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Type Samples</h3>

            <div className="mb-6">
              <h4 className="text-blue-600 font-medium mb-2">Multiple Choice (Single correct)</h4>
              <p className="text-sm text-gray-600 mb-3">Select one correct answer from multiple options</p>

              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="font-medium mb-2">What is the capital of India?</p>
                <p>A) Chennai</p>
                <p>B) Kolkata</p>
                <p>C) Mumbai</p>
                <p>D) New Delhi</p>
                <p className="mt-2 text-blue-600 font-medium">Key: D</p>

                <div className="mt-3 text-xs text-gray-600">
                  <p className="font-medium mb-1">Explanations:</p>
                  <p>
                    <strong>Explanation for A:</strong> Incorrect. Major city in South India, but not the capital
                  </p>
                  <p>
                    <strong>Explanation for B:</strong> Incorrect. Former capital during British rule
                  </p>
                  <p>
                    <strong>Explanation for C:</strong> Incorrect. Commercial capital, but not political capital
                  </p>
                  <p>
                    <strong>Explanation for D:</strong> Correct. Official capital and seat of government
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-blue-600 font-medium mb-2">Multiple Select (More than one correct answer)</h4>
              <p className="text-sm text-gray-600 mb-3">
                Select all correct answers from the options (2-4 correct out of 6)
              </p>

              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="font-medium mb-2">Which of the following are prime numbers?</p>
                <p>A) 2</p>
                <p>B) 4</p>
                <p>C) 3</p>
                <p>D) 6</p>
                <p>E) 5</p>
                <p>F) 9</p>
                <p className="mt-2 text-blue-600 font-medium">Key: A, C, E</p>

                <div className="mt-3 text-xs text-gray-600">
                  <p className="font-medium mb-1">Explanations:</p>
                  <p>
                    <strong>Explanation for A:</strong> Correct. Smallest prime number, only even prime
                  </p>
                  <p>
                    <strong>Explanation for B:</strong> Incorrect. Composite number, divisible by 2
                  </p>
                  <p>
                    <strong>Explanation for C:</strong> Correct. Prime number, divisible only by 1 and 3
                  </p>
                  <p>
                    <strong>Explanation for D:</strong> Incorrect. Composite number, divisible by 2 and 3
                  </p>
                  <p>
                    <strong>Explanation for E:</strong> Correct. Prime number, divisible only by 1 and 5
                  </p>
                  <p>
                    <strong>Explanation for F:</strong> Incorrect. Composite number, 3 × 3
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-blue-600 font-medium mb-2">Fill in the Blanks</h4>
              <p className="text-sm text-gray-600 mb-3">Complete the sentence with appropriate words</p>

              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="font-medium mb-2">The _____ is the largest planet in our solar system.</p>
                <p className="mt-2 text-green-600 font-medium">Key: Jupiter</p>
                <div className="mt-3 text-xs text-gray-600">
                  <p>
                    <strong>Explanation:</strong> Jupiter is the largest planet by both mass and volume in our solar
                    system.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-blue-600 font-medium mb-2">In-Line Choice</h4>
              <p className="text-sm text-gray-600 mb-3">Select the correct option within the sentence</p>

              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="font-medium mb-2">Water boils at [90°C/100°C/110°C] at sea level.</p>
                <p className="mt-2 text-green-600 font-medium">Key: 100°C</p>
                <div className="mt-3 text-xs text-gray-600">
                  <p>
                    <strong>Explanation:</strong> At standard atmospheric pressure (sea level), water boils at exactly
                    100°C or 212°F.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-blue-600 font-medium mb-2">Matching</h4>
              <p className="text-sm text-gray-600 mb-3">Match items from two columns</p>

              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="font-medium mb-2">Match the countries with their capitals:</p>
                <p>1. Brazil A. New Delhi</p>
                <p>2. France B. Tokyo</p>
                <p>3. India C. Brasília</p>
                <p>4. Japan D. Paris</p>
                <p className="mt-2 text-green-600 font-medium">Key: 1-C, 2-D, 3-A, 4-B</p>
                <div className="mt-3 text-xs text-gray-600">
                  <p>
                    <strong>Explanation:</strong> Each country paired with its respective capital city.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-blue-600 font-medium mb-2">True/False</h4>
              <p className="text-sm text-gray-600 mb-3">Determine if the statement is correct</p>

              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="font-medium mb-2">The Earth revolves around the Sun.</p>
                <p>A) True</p>
                <p>B) False</p>
                <p className="mt-2 text-green-600 font-medium">Key: A</p>

                <div className="mt-3 text-xs text-gray-600">
                  <p className="font-medium mb-1">Explanations:</p>
                  <p>
                    <strong>Explanation for A:</strong> Correct. Earth orbits the Sun in an elliptical path
                  </p>
                  <p>
                    <strong>Explanation for B:</strong> Incorrect. This would be the geocentric model
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
