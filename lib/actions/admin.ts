import { 
  updateUserWalletBalance, 
  suspendUserAccount, 
  deleteUserAccount,
  getAllUsers,
  getAdminStats,
  getAllBoards,
  createBoard as createBoardDB,
  updateBoard as updateBoardDB,
  deleteBoard as deleteBoardDB,
  getSubjectsByBoardAndGrade,
  createSubject as createSubjectDB,
  getTopicsBySubject,
  createTopic as createTopicDB,
  getAIRules,
  updateAIRuleStatus,
  updateAIRuleContent,
  getBloomSamples,
  createBloomSampleDB,
  updateBloomSampleDB,
  deleteBloomSampleDB
} from "@/lib/database/sqlite"
import { revalidatePath } from "next/cache"

// User management actions
export async function updateUserCoins(userId: string, newBalance: number) {
  try {
    await updateUserWalletBalance(userId, newBalance)
    
    revalidatePath("/admin/users")
    return { success: true, message: "User coins updated successfully" }
  } catch (error) {
    console.error("Error updating user coins:", error)
    return { success: false, message: "Failed to update user coins" }
  }
}

export async function suspendUser(userId: string) {
  try {
    await suspendUserAccount(userId)
    
    revalidatePath("/admin/users")
    return { success: true, message: "User suspended successfully" }
  } catch (error) {
    console.error("Error suspending user:", error)
    return { success: false, message: "Failed to suspend user" }
  }
}

export async function deleteUser(userId: string) {
  try {
    await deleteUserAccount(userId)
    
    revalidatePath("/admin/users")
    return { success: true, message: "User deleted successfully" }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, message: "Failed to delete user" }
  }
}

export async function getUsers() {
  try {
    return await getAllUsers()
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function getDashboardStats() {
  try {
    return await getAdminStats()
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalUsers: 0,
      totalQuestions: 0,
      pendingQuestions: 0,
      totalRequests: 0,
      recentUsers: [],
      recentQuestions: []
    }
  }
}

// Content management actions
export async function getBoards() {
  try {
    return await getAllBoards()
  } catch (error) {
    console.error("Error fetching boards:", error)
    return []
  }
}

export async function createBoard(data: { name: string; code: string; description?: string }) {
  try {
    await createBoardDB(data.name, data.code, data.description)
    
    revalidatePath("/admin/content")
    return { success: true, message: "Board created successfully" }
  } catch (error) {
    console.error("Error creating board:", error)
    return { success: false, message: "Failed to create board" }
  }
}

export async function updateBoard(id: string, data: { name: string; code: string; description?: string }) {
  try {
    await updateBoardDB(id, data.name, data.code, data.description)
    
    revalidatePath("/admin/content")
    return { success: true, message: "Board updated successfully" }
  } catch (error) {
    console.error("Error updating board:", error)
    return { success: false, message: "Failed to update board" }
  }
}

export async function deleteBoard(id: string) {
  try {
    await deleteBoardDB(id)
    
    revalidatePath("/admin/content")
    return { success: true, message: "Board deleted successfully" }
  } catch (error) {
    console.error("Error deleting board:", error)
    return { success: false, message: "Failed to delete board" }
  }
}

export async function getSubjectsForBoard(boardId: string, grade: number) {
  try {
    return await getSubjectsByBoardAndGrade(boardId, grade)
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return []
  }
}

export async function createSubject(data: { name: string; code: string; boardId: string; gradeLevel: number }) {
  try {
    await createSubjectDB(data.boardId, data.name, data.code, data.gradeLevel)
    
    revalidatePath("/admin/content")
    return { success: true, message: "Subject created successfully" }
  } catch (error) {
    console.error("Error creating subject:", error)
    return { success: false, message: "Failed to create subject" }
  }
}

export async function getTopicsForSubject(subjectId: string) {
  try {
    return await getTopicsBySubject(subjectId)
  } catch (error) {
    console.error("Error fetching topics:", error)
    return []
  }
}

export async function createTopic(data: { name: string; description?: string; subjectId: string }) {
  try {
    await createTopicDB(data.subjectId, data.name, data.description)
    
    revalidatePath("/admin/content")
    return { success: true, message: "Topic created successfully" }
  } catch (error) {
    console.error("Error creating topic:", error)
    return { success: false, message: "Failed to create topic" }
  }
}

// AI Rules management
export async function getAllAIRules() {
  try {
    return await getAIRules()
  } catch (error) {
    console.error("Error fetching AI rules:", error)
    return []
  }
}

export async function toggleAIRule(ruleId: string, ruleType: string) {
  try {
    const rules = await getAIRules()
    const rule = rules.find((r: any) => r.id === ruleId)
    
    if (!rule) {
      throw new Error("Rule not found")
    }
    
    await updateAIRuleStatus(ruleId, !rule.is_active)
    
    revalidatePath("/admin/ai-rules")
    return { success: true, message: "Rule status updated successfully" }
  } catch (error) {
    console.error("Error toggling AI rule:", error)
    return { success: false, message: "Failed to update rule status" }
  }
}

export async function updateAIRule(ruleId: string, ruleType: string, name: string, description: string) {
  try {
    await updateAIRuleContent(ruleId, name, description)
    
    revalidatePath("/admin/ai-rules")
    return { success: true, message: "Rule updated successfully" }
  } catch (error) {
    console.error("Error updating AI rule:", error)
    return { success: false, message: "Failed to update rule" }
  }
}

// Bloom Samples management
export async function getAllBloomSamples() {
  try {
    return await getBloomSamples()
  } catch (error) {
    console.error("Error fetching bloom samples:", error)
    return []
  }
}

export async function createBloomSample(bloomLevel: string, grade: string, subject: string, question: string) {
  try {
    await createBloomSampleDB(bloomLevel, parseInt(grade), subject, 'mcq', question, `Sample ${bloomLevel} question for Grade ${grade} ${subject}`)
    
    revalidatePath("/admin/bloom-samples")
    return { success: true, message: "Sample question created successfully" }
  } catch (error) {
    console.error("Error creating bloom sample:", error)
    return { success: false, message: "Failed to create sample question" }
  }
}

export async function updateBloomSample(sampleId: string, bloomLevel: string, grade: string, subject: string, question: string) {
  try {
    await updateBloomSampleDB(sampleId, bloomLevel, parseInt(grade), subject, 'mcq', question, `Updated ${bloomLevel} question for Grade ${grade} ${subject}`)
    
    revalidatePath("/admin/bloom-samples")
    return { success: true, message: "Sample question updated successfully" }
  } catch (error) {
    console.error("Error updating bloom sample:", error)
    return { success: false, message: "Failed to update sample question" }
  }
}

export async function deleteBloomSample(sampleId: string) {
  try {
    await deleteBloomSampleDB(sampleId)
    
    revalidatePath("/admin/bloom-samples")
    return { success: true, message: "Sample question deleted successfully" }
  } catch (error) {
    console.error("Error deleting bloom sample:", error)
    return { success: false, message: "Failed to delete sample question" }
  }
}