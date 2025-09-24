"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Edit } from "lucide-react"
import { toggleAIRule, updateAIRule } from "@/lib/actions/admin"
import { toast } from "@/components/ui/sonner"

interface AIRuleManagementProps {
  aiRules: any[]
}

export default function AIRuleManagement({ aiRules }: AIRuleManagementProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRule, setSelectedRule] = useState<any>(null)
  const [editForm, setEditForm] = useState({ name: "", description: "" })
  const [isPending, startTransition] = useTransition()

  // Group AI rules by type
  const globalRules = aiRules.filter(rule => rule.rule_type === 'global')
  const questionTypeRules = aiRules.filter(rule => rule.rule_type === 'question_type')
  const bloomsTaxonomyRules = aiRules.filter(rule => rule.rule_type === 'bloom_level')

  const handleToggleRule = (rule: any, ruleType: string) => {
    startTransition(async () => {
      const result = await toggleAIRule(rule.id, ruleType)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleEditRule = (rule: any, ruleType: string) => {
    setSelectedRule({ ...rule, ruleType })
    setEditForm({ name: rule.title, description: rule.description })
    setShowEditModal(true)
  }

  const executeRuleUpdate = () => {
    if (!selectedRule) return

    startTransition(async () => {
      const result = await updateAIRule(
        selectedRule.id,
        selectedRule.ruleType,
        editForm.name,
        editForm.description,
      )
      if (result.success) {
        toast.success(result.message)
        setShowEditModal(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Rule Management</h1>
          <p className="text-gray-600">Configure AI behavior rules for question generation</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">Create Rule</Button>
      </div>

      {/* Global Rules */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Global Rules</h2>
          <p className="text-gray-600 mb-4">Rules that apply to all question generation</p>

          <div className="space-y-4">
            {globalRules.map((rule) => (
              <div key={rule.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">{rule.title}</h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRule(rule, "global")}
                      disabled={isPending}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleRule(rule, "global")}
                      disabled={isPending}
                    >
                      {rule.is_active ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Type Rules */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Question Type Rules</h2>
          <p className="text-gray-600 mb-4">Rules specific to different question formats</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionTypeRules.map((rule) => (
              <div key={rule.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">{rule.title}</h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRule(rule, "question-type")}
                      disabled={isPending}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleRule(rule, "question-type")}
                      disabled={isPending}
                    >
                      {rule.is_active ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bloom's Taxonomy Rules */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Bloom's Taxonomy Rules</h2>
          <p className="text-gray-600 mb-4">Rules specific to different cognitive levels with associated costs</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bloomsTaxonomyRules.map((rule) => (
              <div key={rule.id} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">{rule.title}</h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRule(rule, "blooms-taxonomy")}
                      disabled={isPending}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleRule(rule, "blooms-taxonomy")}
                      disabled={isPending}
                    >
                      {rule.is_active ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit AI Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter rule name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rule Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={6}
                placeholder="Enter rule description and guidelines"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={executeRuleUpdate} disabled={isPending}>
              {isPending ? "Updating..." : "Update Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}