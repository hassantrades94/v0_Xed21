"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Download, Eye, Calendar, BookOpen, Target } from "lucide-react"

interface QuestionLibraryProps {
  questions: any[]
}

export default function QuestionLibrary({ questions }: QuestionLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterDifficulty, setFilterDifficulty] = useState("all")

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || question.question_type === filterType
    const matchesDifficulty = filterDifficulty === "all" || question.difficulty_level === filterDifficulty

    return matchesSearch && matchesType && matchesDifficulty
  })

  const getTypeColor = (type: string) => {
    const colors = {
      mcq: "bg-blue-100 text-blue-800",
      short_answer: "bg-green-100 text-green-800",
      long_answer: "bg-purple-100 text-purple-800",
      fill_blank: "bg-orange-100 text-orange-800",
      true_false: "bg-gray-100 text-gray-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      hard: "bg-red-100 text-red-800",
    }
    return colors[difficulty as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const formatQuestionType = (type: string) => {
    const types = {
      mcq: "Multiple Choice",
      short_answer: "Short Answer",
      long_answer: "Long Answer",
      fill_blank: "Fill in the Blank",
      true_false: "True/False",
    }
    return types[type as keyof typeof types] || type
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Question Library</h1>
        <p className="text-gray-600 mt-2">Browse and manage your generated questions</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Question Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="long_answer">Long Answer</SelectItem>
                  <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600 mb-6">
              {questions.length === 0
                ? "You haven't generated any questions yet. Start by creating your first set of questions."
                : "No questions match your current filters. Try adjusting your search criteria."}
            </p>
            {questions.length === 0 && (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Generate Your First Questions</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <Card key={question.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge className={getTypeColor(question.question_type)}>
                        {formatQuestionType(question.question_type)}
                      </Badge>
                      <Badge className={getDifficultyColor(question.difficulty_level)}>
                        {question.difficulty_level.charAt(0).toUpperCase() + question.difficulty_level.slice(1)}
                      </Badge>
                      {question.bloom_taxonomy_level && (
                        <Badge variant="outline">{question.bloom_taxonomy_level}</Badge>
                      )}
                    </div>

                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{question.question_text}</h3>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          {question.topics?.subjects?.boards?.name} - {question.topics?.subjects?.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>{question.topics?.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(question.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {question.explanation && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {questions.length > 0 && (
        <Card className="border-0 shadow-lg bg-gray-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
                <p className="text-sm text-gray-600">Total Questions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {questions.filter((q) => q.question_type === "mcq").length}
                </p>
                <p className="text-sm text-gray-600">Multiple Choice</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {questions.filter((q) => q.difficulty_level === "medium").length}
                </p>
                <p className="text-sm text-gray-600">Medium Difficulty</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{questions.filter((q) => q.is_approved).length}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
