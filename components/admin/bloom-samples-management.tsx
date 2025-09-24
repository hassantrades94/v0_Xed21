"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Edit, Trash2 } from "lucide-react"
import { createBloomSample, updateBloomSample, deleteBloomSample } from "@/lib/actions/admin"
import { toast } from "@/components/ui/sonner"

interface BloomSamplesManagementProps {
  samples: any[]
}

  const [samples, setSamples] = useState(initialSamples)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSample, setSelectedSample] = useState<any>(null)
  const [sampleForm, setSampleForm] = useState({
    bloomLevel: "",
    grade: "",
    subject: "",
    question: "",
  })
  const [isPending, startTransition] = useTransition()

  const handleAddSample = () => {
    setSampleForm({ bloomLevel: "", grade: "", subject: "", question: "" })
    setShowAddModal(true)
  }

  const handleEditSample = (sample: any) => {
    setSelectedSample(sample)
    setSampleForm({
      bloomLevel: sample.bloom_level,
      grade: sample.grade_level.toString(),
      subject: sample.subject,
      question: sample.sample_question,
    })
    setShowEditModal(true)
  }

  const handleViewSample = (sample: any) => {
    setSelectedSample(sample)
    setShowViewModal(true)
  }

  const handleDeleteSample = (sample: any) => {
    setSelectedSample(sample)
    setShowDeleteDialog(true)
  }

  const executeCreateSample = () => {
    if (!sampleForm.bloomLevel || !sampleForm.grade || !sampleForm.subject || !sampleForm.question) {
      toast.error("Please fill in all fields")
      return
    }

    startTransition(async () => {
      const result = await createBloomSample(
        sampleForm.bloomLevel,
        sampleForm.grade,
        sampleForm.subject,
        sampleForm.question,
      )
      if (result.success) {
        toast.success(result.message)
        setShowAddModal(false)
      } else {
        window.location.reload()
      }
    })
  }

  const executeUpdateSample = () => {
    if (!selectedSample || !sampleForm.bloomLevel || !sampleForm.grade || !sampleForm.subject || !sampleForm.question) {
      toast.error("Please fill in all fields")
      return
    }

    startTransition(async () => {
      const result = await updateBloomSample(
        selectedSample.id,
        sampleForm.bloomLevel,
        sampleForm.grade,
        sampleForm.subject,
        sampleForm.question,
      )
      if (result.success) {
        toast.success(result.message)
        setShowEditModal(false)
        window.location.reload()
      } else {
        toast.error(result.message)
      }
    })
  }

  const executeDeleteSample = () => {
    if (!selectedSample) return

    startTransition(async () => {
      const result = await deleteBloomSample(selectedSample.id)
      if (result.success) {
        toast.success(result.message)
        setShowDeleteDialog(false)
        window.location.reload()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bloom Sample Items Management</h1>
          <p className="text-gray-600">
            Manage sample questions for each Bloom's taxonomy level to guide AI question generation
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddSample}>
          <span className="mr-2">+</span>
          Add Sample Item
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">🔍 Filters:</span>
          </div>

          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bloom Level</label>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="remembering">Remembering</SelectItem>
                  <SelectItem value="understanding">Understanding</SelectItem>
                  <SelectItem value="applying">Applying</SelectItem>
                  <SelectItem value="analyzing">Analyzing</SelectItem>
                  <SelectItem value="evaluating">Evaluating</SelectItem>
                  <SelectItem value="creating">Creating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Grade</label>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All grades</SelectItem>
                  <SelectItem value="1">Grade 1</SelectItem>
                  <SelectItem value="2">Grade 2</SelectItem>
                  <SelectItem value="3">Grade 3</SelectItem>
                  <SelectItem value="4">Grade 4</SelectItem>
                  <SelectItem value="5">Grade 5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Subject</label>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subjects</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm">
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Sample Items Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bloom Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sample Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {samples.map((sample) => (
                <tr key={sample.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{sample.bloom_level}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Grade {sample.grade_level}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {sample.subject}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">{sample.sample_question}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {sample.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sample.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewSample(sample)} disabled={isPending}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditSample(sample)} disabled={isPending}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSample(sample)} disabled={isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Sample Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bloom's Level</label>
                <Select
                  value={sampleForm.bloomLevel}
                  onValueChange={(value) => setSampleForm({ ...sampleForm, bloomLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remembering">Remembering</SelectItem>
                    <SelectItem value="Understanding">Understanding</SelectItem>
                    <SelectItem value="Applying">Applying</SelectItem>
                    <SelectItem value="Analyzing">Analyzing</SelectItem>
                    <SelectItem value="Evaluating">Evaluating</SelectItem>
                    <SelectItem value="Creating">Creating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                <Select
                  value={sampleForm.grade}
                  onValueChange={(value) => setSampleForm({ ...sampleForm, grade: value })}
                >
                  <SelectTrigger>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Select
                  value={sampleForm.subject}
                  onValueChange={(value) => setSampleForm({ ...sampleForm, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Social Studies">Social Studies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sample Question</label>
              <Textarea
                value={sampleForm.question}
                onChange={(e) => setSampleForm({ ...sampleForm, question: e.target.value })}
                rows={6}
                placeholder="Enter the complete sample question with options and correct answer..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={executeCreateSample} disabled={isPending}>
              {isPending ? "Creating..." : "Create Sample"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Sample Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bloom's Level</label>
                <Select
                  value={sampleForm.bloomLevel}
                  onValueChange={(value) => setSampleForm({ ...sampleForm, bloomLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remembering">Remembering</SelectItem>
                    <SelectItem value="Understanding">Understanding</SelectItem>
                    <SelectItem value="Applying">Applying</SelectItem>
                    <SelectItem value="Analyzing">Analyzing</SelectItem>
                    <SelectItem value="Evaluating">Evaluating</SelectItem>
                    <SelectItem value="Creating">Creating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                <Select
                  value={sampleForm.grade}
                  onValueChange={(value) => setSampleForm({ ...sampleForm, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Select
                  value={sampleForm.subject}
                  onValueChange={(value) => setSampleForm({ ...sampleForm, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Social Studies">Social Studies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sample Question</label>
              <Textarea
                value={sampleForm.question}
                onChange={(e) => setSampleForm({ ...sampleForm, question: e.target.value })}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={executeUpdateSample} disabled={isPending}>
              {isPending ? "Updating..." : "Update Sample"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>View Sample Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bloom's Level</label>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {selectedSample?.bloomLevel}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <Badge variant="secondary">Grade {selectedSample?.grade}</Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  {selectedSample?.subject}
                </Badge>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">{selectedSample?.question}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowViewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this sample question? This action cannot be undone and will affect AI
            question generation guidance.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={executeDeleteSample} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete Sample"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
