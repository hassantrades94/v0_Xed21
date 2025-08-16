"use client"

import { useState } from "react"
import { X, Eye, EyeOff, Download, BookOpen, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

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

  // Mock data for question sets
  const questionSets: QuestionSet[] = [
    {
      id: "1",
      subject: "Science",
      topic: "Exploring Magnets",
      board: "cbse/ncert",
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
          explanation: "The magnetic force is strongest at the poles, which are located at both ends of the magnet.",
          confidence: 85,
        },
      ],
    },
    {
      id: "2",
      subject: "Science",
      topic: "Materials Around Us",
      board: "cbse/ncert",
      grade: "Grade 6",
      date: "13 Aug 2025",
      time: "10:28 pm",
      questionType: "Multiple Choice",
      bloomsLevel: "creating",
      questionCount: 5,
      questions: [
        {
          id: "q2",
          question:
            "Imagine that you are designing a new type of classroom storage solution that uses different materials for various purposes. Which combination of materials would be most suitable for creating a durable, lightweight, and water-resistant storage box?",
          options: ["Wood and metal", "Plastic and rubber", "Glass and ceramic", "Paper and cloth"],
          correctAnswer: "B",
          explanation:
            "Plastic provides durability and water resistance while rubber can provide additional protection and grip.",
          confidence: 92,
        },
      ],
    },
  ]

  const handleDownloadPDF = async (setId: string) => {
    setDownloadingSet(setId)
    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setDownloadingSet(null)

    // Here you would implement actual PDF generation
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
          {questionSets.map((set) => (
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
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">{set.questionType}</span>
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
          ))}
        </div>
      </div>
    </div>
  )
}
