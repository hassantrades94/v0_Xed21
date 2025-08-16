"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ChevronDown, ChevronRight, Edit, FileText, Plus, Trash2, X } from "lucide-react"

interface ContentManagementProps {
  boards: any[]
}

export default function ContentManagement({ boards: initialBoards }: ContentManagementProps) {
  const [boards, setBoards] = useState(initialBoards)
  const [selectedBoard, setSelectedBoard] = useState("CBSE/NCERT")
  const [expandedGrades, setExpandedGrades] = useState<{ [key: string]: boolean }>({
    "Grade 1": true,
  })
  const [expandedSubjects, setExpandedSubjects] = useState<{ [key: string]: boolean }>({
    English: true,
  })

  const [showContentModal, setShowContentModal] = useState(false)
  const [showAddBoardModal, setShowAddBoardModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [currentContent, setCurrentContent] = useState({ title: "", content: "" })
  const [newBoardName, setNewBoardName] = useState("")
  const [pendingAction, setPendingAction] = useState<() => void>(() => {})
  const [deleteAction, setDeleteAction] = useState<() => void>(() => {})

  const toggleGrade = (grade: string) => {
    setExpandedGrades((prev) => ({ ...prev, [grade]: !prev[grade] }))
  }

  const toggleSubject = (subject: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [subject]: !prev[subject] }))
  }

  const openContentModal = (topicName: string) => {
    setCurrentContent({
      title: topicName,
      content: `Chapter 1 - ${topicName}\n\nAs human beings, we have always been curious about our surroundings. We start exploring our surroundings and asking questions right from our childhood. Did you enjoy discovering and exploring the world around you in the Preparatory Stage of school? As you enter the Middle Stage, we will continue this fascinating journey, trying to explore and understand the beautiful world we live in. And for that, we have a new subject, Science. Welcome to the wonderful world of Science!\n\nScience is a way of thinking, observing and doing things to understand the world we live in and to uncover the secrets of the universe. Think of it as a big adventure—we ask questions, explore, and then try to find answers to our questions. For this, the most important thing is to be curious and ask questions.`,
    })
    setShowContentModal(true)
  }

  const addBoard = () => {
    if (!newBoardName.trim()) return

    const newBoard = {
      id: Date.now(),
      name: newBoardName,
      subjects: [],
    }

    // Auto-generate grades 1-12 with basic subjects
    for (let grade = 1; grade <= 12; grade++) {
      const basicSubjects =
        grade <= 5
          ? ["English", "Mathematics", "Science", "Social Studies"]
          : ["English", "Mathematics", "Science", "Social Studies", "Hindi"]

      basicSubjects.forEach((subjectName, index) => {
        newBoard.subjects.push({
          id: Date.now() + grade * 100 + index,
          name: subjectName,
          grade: grade,
          topics: [],
        })
      })
    }

    setBoards([...boards, newBoard])
    setNewBoardName("")
    setShowAddBoardModal(false)
  }

  const confirmAction = (action: () => void) => {
    setPendingAction(() => action)
    setShowConfirmDialog(true)
  }

  const confirmDelete = (action: () => void) => {
    setDeleteAction(() => action)
    setShowDeleteConfirmDialog(true)
  }

  const executeAction = () => {
    pendingAction()
    setShowConfirmDialog(false)
  }

  const executeDelete = () => {
    deleteAction()
    setShowDeleteConfirmDialog(false)
  }

  const removeBoard = (boardName: string) => {
    setBoards(boards.filter((b) => b.name !== boardName))
    if (selectedBoard === boardName) {
      setSelectedBoard(boards[0]?.name || "")
    }
  }

  // Mock grade data
  const grades = [
    { name: "Grade 1", subjects: 3 },
    { name: "Grade 2", subjects: 3 },
    { name: "Grade 3", subjects: 4 },
    { name: "Grade 4", subjects: 4 },
  ]

  const currentBoard = boards.find((b) => b.name === selectedBoard) || boards[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Content Management</h1>
          <p className="text-gray-600">
            Manage educational content structure by boards, grades, subjects, and topics. Click the{" "}
            <FileText className="inline h-4 w-4" /> icon next to any topic to manage its content.
          </p>
        </div>
        <Button onClick={() => setShowAddBoardModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Board
        </Button>
      </div>

      {/* Board Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Board</label>
              <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {boards.map((board) => (
                    <SelectItem key={board.name} value={board.name}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {boards.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => confirmDelete(() => removeBoard(selectedBoard))}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Board
              </Button>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{selectedBoard} Structure</h2>

            <div className="space-y-4">
              {grades.map((grade) => (
                <div key={grade.name} className="border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between p-4 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <button onClick={() => toggleGrade(grade.name)} className="text-gray-500">
                        {expandedGrades[grade.name] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <span className="font-medium text-gray-900">{grade.name}</span>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {grade.subjects} subjects
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Subject
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmAction(() => console.log(`Edit ${grade.name}`))}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {expandedGrades[grade.name] && (
                    <div className="p-4 space-y-3">
                      {currentBoard.subjects
                        ?.filter((subject: any) => subject.grade === Number.parseInt(grade.name.split(" ")[1]))
                        .map((subject: any) => (
                          <div key={subject.id} className="border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between p-3 bg-gray-50">
                              <div className="flex items-center space-x-3">
                                <button onClick={() => toggleSubject(subject.name)} className="text-gray-500">
                                  {expandedSubjects[subject.name] ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                                <span className="font-medium text-gray-900">{subject.name}</span>
                                <span className="text-sm text-gray-500">{subject.topics?.length || 0} topics</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => confirmAction(() => console.log(`Edit ${subject.name}`))}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => confirmDelete(() => console.log(`Delete ${subject.name}`))}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {expandedSubjects[subject.name] && (
                              <div className="p-3 space-y-2">
                                {subject.topics?.map((topic: any) => (
                                  <div
                                    key={topic.id}
                                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                                  >
                                    <span className="text-sm text-gray-900">{topic.name}</span>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openContentModal(topic.name)}
                                        title="Manage content"
                                      >
                                        <FileText className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => confirmAction(() => console.log(`Edit ${topic.name}`))}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => confirmDelete(() => console.log(`Delete ${topic.name}`))}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showContentModal} onOpenChange={setShowContentModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Manage Content: {currentContent.title}</DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowContentModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Upload files or add text content for this topic. AI will extract information from uploaded files.
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Upload Files Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upload Files</h3>
                <span className="text-sm text-gray-500">PDF, DOCX, XLSX, CSV, TXT</span>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input type="file" className="w-full" accept=".pdf,.docx,.xlsx,.csv,.txt" />
                <p className="text-sm text-gray-500 mt-2">
                  When you upload a file, AI will automatically extract all relevant information and replace any
                  existing content for this topic.
                </p>
              </div>
            </div>

            {/* Manual Content Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Manual Content</h3>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Content
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title: {currentContent.title}</label>
                  <p className="text-sm text-gray-600">The content will be associated with this topic</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <Textarea
                    value={currentContent.content}
                    onChange={(e) => setCurrentContent({ ...currentContent, content: e.target.value })}
                    rows={12}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Current Content Display */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Current Content (1)</h3>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{currentContent.title}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">Created: 08/08/2025</p>
                <p className="text-sm text-gray-800">{currentContent.content.substring(0, 200)}...</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContentModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowContentModal(false)} className="bg-blue-600 hover:bg-blue-700">
              Update Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddBoardModal} onOpenChange={setShowAddBoardModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Board</DialogTitle>
            <p className="text-sm text-gray-600">
              Create a new educational board. Grades 1-12 will be automatically added with basic subjects.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Board Name</label>
              <Input
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="e.g., Maharashtra State Board"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBoardModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => confirmAction(addBoard)} className="bg-blue-600 hover:bg-blue-700">
              Add Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <p className="text-sm text-gray-600">
              Are you sure you want to proceed with this action? This change will be saved immediately.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={executeAction} className="bg-blue-600 hover:bg-blue-700">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this item? This action cannot be undone and will permanently remove all
              associated content.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={executeDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
