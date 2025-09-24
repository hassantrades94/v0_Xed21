import 'server-only'

import { readFileSync } from 'fs'
import { join } from 'path'

// Conditional import to prevent client-side bundling
const Database = typeof window === 'undefined' ? require('better-sqlite3') : null

let db: Database.Database | null = null

export async function getDatabase() {
  if (typeof window !== 'undefined') {
    throw new Error('Database operations are only available on the server')
  }
  
  if (db) {
    return db
  }

  // Create database connection
  db = new Database('database.sqlite')
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON')
  
  // Read and execute schema
  const schemaPath = join(process.cwd(), 'lib', 'schema.sql')
  const schema = readFileSync(schemaPath, 'utf-8')
  
  // Split schema by semicolons and execute each statement
  const statements = schema.split(';').filter(stmt => stmt.trim())
  
  for (const statement of statements) {
    if (statement.trim()) {
      db.exec(statement)
    }
  }
  
  return db
}

// Admin-specific database operations
export async function getAdminStats() {
  const db = await getDatabase()
  
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  const totalQuestions = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number }
  const pendingQuestions = db.prepare('SELECT COUNT(*) as count FROM questions WHERE status = ?').get('pending') as { count: number }
  const totalRequests = db.prepare('SELECT COUNT(*) as count FROM question_requests').get() as { count: number }
  
  const recentUsers = db.prepare(`
    SELECT id, full_name, email, created_at, is_active 
    FROM users 
    ORDER BY created_at DESC 
    LIMIT 5
  `).all()
  
  const recentQuestions = db.prepare(`
    SELECT q.id, q.question_text, q.is_approved, u.full_name as user_name, t.name as topic_name
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN topics t ON q.topic_id = t.id
    ORDER BY q.created_at DESC
    LIMIT 5
  `).all()
  
  return {
    totalUsers: totalUsers.count,
    totalQuestions: totalQuestions.count,
    pendingQuestions: pendingQuestions.count,
    totalRequests: totalRequests.count,
    recentUsers,
    recentQuestions
  }
}

export async function getAllUsers() {
  const db = await getDatabase()
  return db.prepare(`
    SELECT id, full_name, email, wallet_balance, is_active, created_at
    FROM users
    ORDER BY created_at DESC
  `).all()
}

export async function updateUserWalletBalance(userId: string, newBalance: number) {
  const db = await getDatabase()
  
  const stmt = db.prepare('UPDATE users SET wallet_balance = ? WHERE id = ?')
  stmt.run(newBalance, userId)
  
  // Record transaction
  const transactionStmt = db.prepare(`
    INSERT INTO wallet_transactions (user_id, type, amount, description, status, balance_after)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  transactionStmt.run(userId, 'admin_adjustment', newBalance, 'Admin balance adjustment', 'completed', newBalance)
}

export async function suspendUserAccount(userId: string) {
  const db = await getDatabase()
  const stmt = db.prepare('UPDATE users SET is_active = 0 WHERE id = ?')
  stmt.run(userId)
}

export async function deleteUserAccount(userId: string) {
  const db = await getDatabase()
  const stmt = db.prepare('DELETE FROM users WHERE id = ?')
  stmt.run(userId)
}

export async function getAllBoards() {
  const db = await getDatabase()
  return db.prepare('SELECT * FROM boards ORDER BY name').all()
}

export async function createBoard(name: string, code: string, description?: string) {
  const db = await getDatabase()
  const id = crypto.randomUUID()
  
  const stmt = db.prepare(`
    INSERT INTO boards (id, name, code, description)
    VALUES (?, ?, ?, ?)
  `)
  stmt.run(id, name, code, description || '')
  
  return { id, name, code, description }
}

export async function updateBoard(id: string, name: string, code: string, description?: string) {
  const db = await getDatabase()
  const stmt = db.prepare(`
    UPDATE boards 
    SET name = ?, code = ?, description = ?
    WHERE id = ?
  `)
  stmt.run(name, code, description || '', id)
}

export async function deleteBoard(id: string) {
  const db = await getDatabase()
  const stmt = db.prepare('DELETE FROM boards WHERE id = ?')
  stmt.run(id)
}

export async function getSubjectsByBoardAndGrade(boardId: string, grade: number) {
  const db = await getDatabase()
  return db.prepare(`
    SELECT * FROM subjects 
    WHERE board_id = ? AND grade_level = ?
    ORDER BY name
  `).all(boardId, grade)
}

export async function createSubject(boardId: string, name: string, code: string, gradeLevel: number) {
  const db = await getDatabase()
  const id = crypto.randomUUID()
  
  const stmt = db.prepare(`
    INSERT INTO subjects (id, board_id, name, code, grade_level)
    VALUES (?, ?, ?, ?, ?)
  `)
  stmt.run(id, boardId, name, code, gradeLevel)
  
  return { id, board_id: boardId, name, code, grade_level: gradeLevel }
}

export async function getTopicsBySubject(subjectId: string) {
  const db = await getDatabase()
  return db.prepare(`
    SELECT * FROM topics 
    WHERE subject_id = ?
    ORDER BY order_index, name
  `).all(subjectId)
}

export async function createTopic(subjectId: string, name: string, description?: string) {
  const db = await getDatabase()
  const id = crypto.randomUUID()
  
  const stmt = db.prepare(`
    INSERT INTO topics (id, subject_id, name, description)
    VALUES (?, ?, ?, ?)
  `)
  stmt.run(id, subjectId, name, description || '')
  
  return { id, subject_id: subjectId, name, description }
}

export async function getAIRules() {
  const db = await getDatabase()
  return db.prepare('SELECT * FROM ai_rules ORDER BY rule_type, title').all()
}

export async function updateAIRuleStatus(id: string, isActive: boolean) {
  const db = await getDatabase()
  const stmt = db.prepare('UPDATE ai_rules SET is_active = ? WHERE id = ?')
  stmt.run(isActive ? 1 : 0, id)
}

export async function updateAIRuleContent(id: string, title: string, description: string) {
  const db = await getDatabase()
  const stmt = db.prepare('UPDATE ai_rules SET title = ?, description = ? WHERE id = ?')
  stmt.run(title, description, id)
}

export async function getBloomSamples() {
  const db = await getDatabase()
  return db.prepare(`
    SELECT * FROM bloom_samples 
    ORDER BY bloom_level, grade_level, subject
  `).all()
}

export async function createBloomSampleDB(bloomLevel: string, gradeLevel: number, subject: string, questionType: string, sampleQuestion: string, explanation?: string) {
  const db = await getDatabase()
  const id = crypto.randomUUID()
  
  const stmt = db.prepare(`
    INSERT INTO bloom_samples (id, bloom_level, grade_level, subject, question_type, sample_question, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  stmt.run(id, bloomLevel, gradeLevel, subject, questionType, sampleQuestion, explanation || '')
  
  return { id, bloom_level: bloomLevel, grade_level: gradeLevel, subject, question_type: questionType, sample_question: sampleQuestion, explanation }
}

export async function updateBloomSampleDB(id: string, bloomLevel: string, gradeLevel: number, subject: string, questionType: string, sampleQuestion: string, explanation?: string) {
  const db = await getDatabase()
  const stmt = db.prepare(`
    UPDATE bloom_samples 
    SET bloom_level = ?, grade_level = ?, subject = ?, question_type = ?, sample_question = ?, explanation = ?
    WHERE id = ?
  `)
  stmt.run(bloomLevel, gradeLevel, subject, questionType, sampleQuestion, explanation || '', id)
}

export async function deleteBloomSampleDB(id: string) {
  const db = await getDatabase()
  const stmt = db.prepare('DELETE FROM bloom_samples WHERE id = ?')
  stmt.run(id)
}