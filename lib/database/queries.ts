import db from './sqlite'

// User queries
export const getUserByEmail = (email: string) => {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
  return stmt.get(email)
}

export const getUserById = (id: string) => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
  return stmt.get(id)
}

export const createUser = (userData: any) => {
  const stmt = db.prepare(`
    INSERT INTO users (id, email, full_name, role, organization, phone, wallet_balance, is_verified, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  return stmt.run(
    userData.id,
    userData.email,
    userData.full_name,
    userData.role || 'educator',
    userData.organization,
    userData.phone,
    userData.wallet_balance || 500,
    userData.is_verified || false,
    userData.is_active || true
  )
}

// Board queries
export const getAllBoards = () => {
  const stmt = db.prepare('SELECT * FROM boards WHERE is_active = 1 ORDER BY name')
  return stmt.all()
}

// Subject queries
export const getSubjectsByBoardAndGrade = (boardId: string, gradeLevel: number) => {
  const stmt = db.prepare(`
    SELECT * FROM subjects 
    WHERE board_id = ? AND grade_level = ? AND is_active = 1 
    ORDER BY name
  `)
  return stmt.all(boardId, gradeLevel)
}

// Topic queries
export const getTopicsBySubject = (subjectId: string) => {
  const stmt = db.prepare(`
    SELECT * FROM topics 
    WHERE subject_id = ? AND is_active = 1 
    ORDER BY order_index, name
  `)
  return stmt.all(subjectId)
}

// Question queries
export const createQuestion = (questionData: any) => {
  const stmt = db.prepare(`
    INSERT INTO questions (
      id, user_id, topic_id, question_text, question_type, difficulty_level,
      options, correct_answer, explanation, bloom_taxonomy_level, 
      confidence_score, estimated_time, marks, is_approved
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  return stmt.run(
    questionData.id,
    questionData.user_id,
    questionData.topic_id,
    questionData.question_text,
    questionData.question_type,
    questionData.difficulty_level,
    JSON.stringify(questionData.options),
    questionData.correct_answer,
    questionData.explanation,
    questionData.bloom_taxonomy_level,
    questionData.confidence_score || 85,
    questionData.estimated_time || 2,
    questionData.marks || 1,
    questionData.is_approved || true
  )
}

export const getQuestionsByUser = (userId: string) => {
  const stmt = db.prepare(`
    SELECT q.*, t.name as topic_name, s.name as subject_name, b.name as board_name
    FROM questions q
    LEFT JOIN topics t ON q.topic_id = t.id
    LEFT JOIN subjects s ON t.subject_id = s.id
    LEFT JOIN boards b ON s.board_id = b.id
    WHERE q.user_id = ?
    ORDER BY q.created_at DESC
  `)
  return stmt.all(userId)
}

// Transaction queries
export const createTransaction = (transactionData: any) => {
  const stmt = db.prepare(`
    INSERT INTO wallet_transactions (
      id, user_id, transaction_type, amount, balance_after, 
      description, reference_id, reference_type, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  return stmt.run(
    transactionData.id,
    transactionData.user_id,
    transactionData.transaction_type,
    transactionData.amount,
    transactionData.balance_after,
    transactionData.description,
    transactionData.reference_id,
    transactionData.reference_type,
    transactionData.status || 'completed'
  )
}

export const getTransactionsByUser = (userId: string, limit: number = 50) => {
  const stmt = db.prepare(`
    SELECT * FROM wallet_transactions 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `)
  return stmt.all(userId, limit)
}

// Update user wallet balance
export const updateUserWalletBalance = (userId: string, newBalance: number) => {
  const stmt = db.prepare('UPDATE users SET wallet_balance = ? WHERE id = ?')
  return stmt.run(newBalance, userId)
}

// Admin queries
export const getAdminByEmail = (email: string) => {
  const stmt = db.prepare('SELECT * FROM admin_users WHERE email = ? AND is_active = 1')
  return stmt.get(email)
}

export const getAllUsers = () => {
  const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC')
  return stmt.all()
}