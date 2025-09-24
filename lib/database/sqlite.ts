import Database from 'better-sqlite3'
import path from 'path'

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'data', 'xed21.db')
let db: Database.Database

try {
  db = new Database(dbPath)
  console.log('SQLite database connected successfully')
} catch (error) {
  console.error('Failed to connect to SQLite database:', error)
  // Create in-memory database as fallback
  db = new Database(':memory:')
}

// Create tables
const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'educator',
      organization TEXT,
      phone TEXT,
      is_verified BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      wallet_balance REAL DEFAULT 500.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Admin users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'super_admin',
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Boards table
  db.exec(`
    CREATE TABLE IF NOT EXISTS boards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Subjects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      board_id TEXT,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      grade_level INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (board_id) REFERENCES boards(id)
    )
  `)

  // Topics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      subject_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      order_index INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
    )
  `)

  // Questions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      topic_id TEXT,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL,
      difficulty_level TEXT NOT NULL,
      options TEXT, -- JSON string
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      bloom_taxonomy_level TEXT,
      confidence_score INTEGER DEFAULT 85,
      estimated_time INTEGER DEFAULT 2,
      marks INTEGER DEFAULT 1,
      is_approved BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (topic_id) REFERENCES topics(id)
    )
  `)

  // Wallet transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      transaction_type TEXT NOT NULL,
      amount REAL NOT NULL,
      balance_after REAL NOT NULL,
      description TEXT NOT NULL,
      reference_id TEXT,
      reference_type TEXT,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  console.log('Database tables created successfully')
}

// Seed initial data
const seedData = () => {
  // Insert boards
  const insertBoard = db.prepare(`
    INSERT OR IGNORE INTO boards (id, name, code, description) 
    VALUES (?, ?, ?, ?)
  `)
  
  insertBoard.run('cbse', 'CBSE/NCERT', 'CBSE', 'Central Board of Secondary Education')
  insertBoard.run('icse', 'ICSE/CISCE', 'ICSE', 'Indian Certificate of Secondary Education')
  insertBoard.run('state', 'State Boards', 'STATE', 'Various State Education Boards')

  // Insert subjects for CBSE Grade 6
  const insertSubject = db.prepare(`
    INSERT OR IGNORE INTO subjects (id, board_id, name, code, grade_level) 
    VALUES (?, ?, ?, ?, ?)
  `)
  
  insertSubject.run('cbse-science-6', 'cbse', 'Science', 'SCI6', 6)
  insertSubject.run('cbse-math-6', 'cbse', 'Mathematics', 'MAT6', 6)
  insertSubject.run('cbse-english-6', 'cbse', 'English', 'ENG6', 6)
  insertSubject.run('cbse-hindi-6', 'cbse', 'Hindi', 'HIN6', 6)
  insertSubject.run('cbse-sst-6', 'cbse', 'Social Science', 'SST6', 6)

  // Insert topics for Science Grade 6
  const insertTopic = db.prepare(`
    INSERT OR IGNORE INTO topics (id, subject_id, name, description, order_index) 
    VALUES (?, ?, ?, ?, ?)
  `)
  
  insertTopic.run('exploring-magnets', 'cbse-science-6', 'Exploring Magnets', 'Understanding magnetic properties and behavior', 1)
  insertTopic.run('light-shadows', 'cbse-science-6', 'Light and Shadows', 'Properties of light and shadow formation', 2)
  insertTopic.run('motion-measurement', 'cbse-science-6', 'Motion and Measurement', 'Types of motion and measurement of distances', 3)
  insertTopic.run('materials-around-us', 'cbse-science-6', 'Materials Around Us', 'Classification and properties of materials', 4)
  insertTopic.run('living-organisms', 'cbse-science-6', 'Living Organisms and Their Surroundings', 'Characteristics of living things', 5)
  insertTopic.run('components-food', 'cbse-science-6', 'Components of Food', 'Nutrients and their importance', 6)

  // Insert topics for Mathematics Grade 6
  insertTopic.run('knowing-numbers', 'cbse-math-6', 'Knowing Our Numbers', 'Place value and number systems', 1)
  insertTopic.run('whole-numbers', 'cbse-math-6', 'Whole Numbers', 'Properties of whole numbers', 2)
  insertTopic.run('playing-numbers', 'cbse-math-6', 'Playing with Numbers', 'Factors and multiples', 3)
  insertTopic.run('basic-geometry', 'cbse-math-6', 'Basic Geometrical Ideas', 'Points, lines, and shapes', 4)
  insertTopic.run('fractions', 'cbse-math-6', 'Fractions', 'Understanding fractions', 5)
  insertTopic.run('decimals', 'cbse-math-6', 'Decimals', 'Decimal numbers and operations', 6)

  // Insert demo user
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, full_name, role, wallet_balance, is_verified, is_active) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  
  insertUser.run('demo-user-123', 'geology.cupb16@gmail.com', 'Mamun', 'educator', 9500, true, true)

  // Insert admin user
  const insertAdmin = db.prepare(`
    INSERT OR IGNORE INTO admin_users (id, email, full_name, role) 
    VALUES (?, ?, ?, ?)
  `)
  
  insertAdmin.run('admin-1', 'hassan.jobs07@gmail.com', 'Hassan Admin', 'super_admin')

  console.log('Database seeded successfully')
}

// Initialize database
createTables()
seedData()

export { db }
export default db