"use client"

import { useState, useEffect } from "react"
import { X, Eye, EyeOff, Download, BookOpen, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface QuestionSet {
  id: string
  subject: string
  topic: string
  board: string
  grade: string
  date: string
  time: string
  questionType: string
  bloomsLevel: string
  questionCount: number
  questions: Array<{
    id: string
    question: string
    options: string[]
    correctAnswer: string
    explanation: string
    confidence: number
  }>
}

interface QuestionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function QuestionHistoryModal({ isOpen, onClose }: QuestionHistoryModalProps) {
  const [expandedSet, setExpandedSet] = useState<string | null>(null)
  const [downloadingSet, setDownloadingSet] = useState<string | null>(null)
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadQuestionHistory()
    }
  }, [isOpen])

  const loadQuestionHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: questions } = await supabase
          .from("questions")
          .select(`
            *,
            boards(name),
            subjects(name),
            topics(name)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10)

        if (questions) {
          const groupedSets = questions.reduce((acc: any[], question: any) => {
            const existingSet = acc.find(
              (set) =>
                set.subject === question.subjects?.name &&
                set.topic === question.topics?.name &&
                new Date(set.rawDate).toDateString() === new Date(question.created_at).toDateString(),
            )

            const questionData = {
              id: question.id,
              question: question.question_text,
              options: question.options || [],
              correctAnswer: question.correct_answer,
              explanation: question.explanation,
              confidence: question.confidence_score || 85,
            }

            if (existingSet) {
              existingSet.questions.push(questionData)
              existingSet.questionCount = existingSet.questions.length
            } else {
              const date = new Date(question.created_at)
              acc.push({
                id: question.id,
                subject: question.subjects?.name || "Unknown Subject",
                topic: question.topics?.name || "Unknown Topic",
                board: question.boards?.name || "Unknown Board",
                grade: `Grade ${question.grade_level || "Unknown"}`,
                date: date.toLocaleDateString(),
                time: date.toLocaleTimeString(),
                rawDate: question.created_at,
                questionType: question.question_type || "Multiple Choice",
                bloomsLevel: question.bloom_level || "understanding",
                questionCount: 1,
                questions: [questionData],
              })
            }
            return acc
          }, [])

          setQuestionSets(groupedSets)
        }
      }
    } catch (error) {
      console.error("Error loading question history:", error)
      setQuestionSets([
        {
          id: "demo-1",
          subject: "Science",
          topic: "Exploring Magnets",
          board: "CBSE/NCERT",
          grade: "Grade 6",
          date: "15 Aug 2025",
          time: "09:14 am",
          questionType: "Multiple Choice",
          bloomsLevel: "understanding",
          questionCount: 5,
          questions: [
            {
              id: "q1",
              question:
                "A team of students conducted an experiment by placing a bar magnet over iron filings spread on a sheet of paper. They observed that most filings gathered at specific parts of the magnet. Based on the diagram showing the distribution of iron filings, explain where the magnetic force is strongest on the bar magnet.",
              options: ["At both ends", "At the center", "On the sides", "Evenly distributed"],
              correctAnswer: "A",
              explanation:
                "The magnetic force is strongest at the poles, which are located at both ends of the magnet.",
              confidence: 85,
            },
          ],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async (setId: string) => {
    setDownloadingSet(setId)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setDownloadingSet(null)
    console.log(`Downloading PDF for set ${setId}`)
  }

  const toggleExpanded = (setId: string) => {
    setExpandedSet(expandedSet === setId ? null : setId)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Question Generation History</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading question history...</p>
            </div>
          ) : questionSets.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions generated yet</h3>
              <p className="text-gray-600">Your question generation history will appear here.</p>
            </div>
          ) : (
            questionSets.map((set) => (
              <div key={set.id} className="border rounded-lg p-4 space-y-4">
                {/* Set Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">
                        {set.subject} - {set.topic}
                      </h3>
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        # {set.questionCount}
                      </div>
                      <span className="text-gray-500 text-sm">questions</span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <span className="w-4 h-4 rounded-full bg-gray-400"></span>
                        <span>
                          {set.board} | {set.grade}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {set.date}, {set.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {set.questionType}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          set.bloomsLevel === "understanding"
                            ? "bg-purple-100 text-purple-800"
                            : set.bloomsLevel === "creating"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {set.bloomsLevel}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDownloadPDF(set.id)}
                    disabled={downloadingSet === set.id}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloadingSet === set.id ? "Generating..." : "Download PDF"}
                  </Button>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => toggleExpanded(set.id)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  {expandedSet === set.id ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      <span>Hide Questions</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>View All Questions</span>
                    </>
                  )}
                </button>

                {/* Preview or Full Questions */}
                {expandedSet === set.id ? (
                  <div className="space-y-4">
                    {set.questions.map((question, index) => (
                      <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">
                              Q{index + 1}
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                set.bloomsLevel === "understanding"
                                  ? "bg-purple-100 text-purple-800"
                                  : set.bloomsLevel === "creating"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {set.bloomsLevel}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">Confidence: {question.confidence}%</span>
                        </div>

                        <p className="text-gray-800 mb-4">{question.question}</p>

                        <div className="space-y-2 mb-4">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-2 rounded ${
                                String.fromCharCode(65 + optionIndex) === question.correctAnswer
                                  ? "bg-green-100 border border-green-300"
                                  : "bg-white border border-gray-200"
                              }`}
                            >
                              <span className="font-medium">{String.fromCharCode(65 + optionIndex)})</span> {option}
                            </div>
                          ))}
                        </div>

                        <div className="text-sm">
                          <span className="font-medium text-green-700">Correct Answer: {question.correctAnswer}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Preview:</h4>
                    <p className="text-gray-700 mb-2">{set.questions[0]?.question.substring(0, 150)}...</p>
                    <p className="text-sm text-gray-500">
                      Click "View All Questions" to see all {set.questionCount} questions
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
