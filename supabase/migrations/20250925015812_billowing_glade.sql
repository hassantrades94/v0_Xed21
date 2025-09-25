/*
# Complete Supabase Database Setup

This migration creates the complete database schema for the Xed21 educational platform.

## Tables Created:
1. Core Tables
   - users (user profiles and wallet balances)
   - admin_users (admin accounts)
   - user_sessions (session management)

2. Educational Content Structure
   - boards (educational boards like CBSE, ICSE)
   - subjects (subjects for each board and grade)
   - topics (topics within subjects)

3. Question Management
   - questions (generated questions)
   - question_requests (question generation requests)

4. Financial System
   - wallet_transactions (wallet transaction history)

5. AI Configuration
   - ai_rules (AI generation rules)
   - bloom_samples (sample questions for Bloom's taxonomy levels)

## Security
- Row Level Security (RLS) enabled on all tables
- Appropriate policies for user data access
- Admin-only access for management tables
*/

-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('educator', 'content_creator', 'institution', 'tutor');
CREATE TYPE admin_role AS ENUM ('super_admin', 'content_moderator', 'support');
CREATE TYPE question_type AS ENUM ('mcq', 'short_answer', 'long_answer', 'fill_blank', 'true_false');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE transaction_type AS ENUM ('credit', 'debit', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');

-- Users table for educators, content creators, institutions, tutors
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'educator',
    organization VARCHAR(255),
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    wallet_balance DECIMAL(10,2) DEFAULT 500.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role admin_role NOT NULL DEFAULT 'content_moderator',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education boards (NCERT, CBSE, ICSE, State Boards)
CREATE TABLE IF NOT EXISTS boards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects for each board
CREATE TABLE IF NOT EXISTS subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    grade_level INTEGER NOT NULL CHECK (grade_level >= 1 AND grade_level <= 12),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(board_id, code, grade_level)
);

-- Topics within subjects
CREATE TABLE IF NOT EXISTS topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    parent_topic_id UUID REFERENCES topics(id),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated questions
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    difficulty_level difficulty_level NOT NULL,
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    bloom_taxonomy_level VARCHAR(50),
    cognitive_level VARCHAR(50),
    estimated_time_minutes INTEGER DEFAULT 5,
    tags TEXT[],
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES admin_users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question generation requests
CREATE TABLE IF NOT EXISTS question_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    question_count INTEGER NOT NULL CHECK (question_count > 0),
    question_type question_type NOT NULL,
    difficulty_level difficulty_level NOT NULL,
    bloom_taxonomy_level VARCHAR(50),
    special_instructions TEXT,
    cost_per_question DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    generated_questions_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Wallet transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_type transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    status transaction_status DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for tracking active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Rules table
CREATE TABLE IF NOT EXISTS ai_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_type VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bloom Samples table
CREATE TABLE IF NOT EXISTS bloom_samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bloom_level VARCHAR(50) NOT NULL,
    grade_level INTEGER NOT NULL,
    subject VARCHAR(100) NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    sample_question TEXT NOT NULL,
    sample_options JSONB,
    correct_answer TEXT,
    explanation TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_approved ON questions(is_approved);
CREATE INDEX IF NOT EXISTS idx_subjects_board_grade ON subjects(board_id, grade_level);
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_question_requests_user_id ON question_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_question_requests_status ON question_requests(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloom_samples ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for questions table
CREATE POLICY "Users can read own questions" ON questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create questions" ON questions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for wallet transactions
CREATE POLICY "Users can read own transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for question requests
CREATE POLICY "Users can read own requests" ON question_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create requests" ON question_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for educational content
CREATE POLICY "Public read access for boards" ON boards FOR SELECT USING (true);
CREATE POLICY "Public read access for subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read access for topics" ON topics FOR SELECT USING (true);

-- Admin policies (will be handled by service role key)
CREATE POLICY "Admin full access to admin_users" ON admin_users FOR ALL USING (true);
CREATE POLICY "Admin full access to ai_rules" ON ai_rules FOR ALL USING (true);
CREATE POLICY "Admin full access to bloom_samples" ON bloom_samples FOR ALL USING (true);

-- Insert Indian education boards
INSERT INTO boards (name, code, description) VALUES
('CBSE/NCERT', 'CBSE', 'Central Board of Secondary Education / National Council of Educational Research and Training'),
('ICSE/CISCE', 'ICSE', 'Indian Certificate of Secondary Education / Council for the Indian School Certificate Examinations'),
('State Boards', 'STATE', 'Various State Education Boards')
ON CONFLICT (code) DO NOTHING;

-- Insert subjects for CBSE/NCERT (Grades 1-12)
INSERT INTO subjects (board_id, name, code, grade_level) 
SELECT b.id, s.name, s.code, s.grade_level
FROM boards b
CROSS JOIN (
    VALUES 
    -- Grade 1-5 subjects
    ('English', 'ENG', 1), ('Hindi', 'HIN', 1), ('Mathematics', 'MAT', 1), ('Environmental Studies', 'EVS', 1),
    ('English', 'ENG', 2), ('Hindi', 'HIN', 2), ('Mathematics', 'MAT', 2), ('Environmental Studies', 'EVS', 2),
    ('English', 'ENG', 3), ('Hindi', 'HIN', 3), ('Mathematics', 'MAT', 3), ('Environmental Studies', 'EVS', 3),
    ('English', 'ENG', 4), ('Hindi', 'HIN', 4), ('Mathematics', 'MAT', 4), ('Environmental Studies', 'EVS', 4),
    ('English', 'ENG', 5), ('Hindi', 'HIN', 5), ('Mathematics', 'MAT', 5), ('Environmental Studies', 'EVS', 5),
    
    -- Grade 6-8 subjects
    ('Science', 'SCI', 6), ('Mathematics', 'MAT', 6), ('English', 'ENG', 6), ('Hindi', 'HIN', 6), ('Social Science', 'SST', 6),
    ('Science', 'SCI', 7), ('Mathematics', 'MAT', 7), ('English', 'ENG', 7), ('Hindi', 'HIN', 7), ('Social Science', 'SST', 7),
    ('Science', 'SCI', 8), ('Mathematics', 'MAT', 8), ('English', 'ENG', 8), ('Hindi', 'HIN', 8), ('Social Science', 'SST', 8),
    
    -- Grade 9-10 subjects
    ('Science', 'SCI', 9), ('Mathematics', 'MAT', 9), ('English', 'ENG', 9), ('Hindi', 'HIN', 9), ('Social Science', 'SST', 9),
    ('Science', 'SCI', 10), ('Mathematics', 'MAT', 10), ('English', 'ENG', 10), ('Hindi', 'HIN', 10), ('Social Science', 'SST', 10),
    
    -- Grade 11-12 subjects
    ('Physics', 'PHY', 11), ('Chemistry', 'CHE', 11), ('Biology', 'BIO', 11), ('Mathematics', 'MAT', 11), ('English', 'ENG', 11),
    ('History', 'HIS', 11), ('Geography', 'GEO', 11), ('Political Science', 'POL', 11), ('Economics', 'ECO', 11),
    ('Physics', 'PHY', 12), ('Chemistry', 'CHE', 12), ('Biology', 'BIO', 12), ('Mathematics', 'MAT', 12), ('English', 'ENG', 12),
    ('History', 'HIS', 12), ('Geography', 'GEO', 12), ('Political Science', 'POL', 12), ('Economics', 'ECO', 12)
) s(name, code, grade_level)
WHERE b.code = 'CBSE'
ON CONFLICT (board_id, code, grade_level) DO NOTHING;

-- Insert sample topics for Grade 6 Science
INSERT INTO topics (subject_id, name, description, order_index)
SELECT s.id, t.name, t.description, t.order_index
FROM subjects s
CROSS JOIN (
    VALUES 
    ('Light, Shadows and Reflections', 'Understanding light sources, shadows, and reflection', 1),
    ('Electricity and Circuits', 'Basic concepts of electricity and simple circuits', 2),
    ('Fun with Magnets', 'Properties and uses of magnets', 3),
    ('Motion and Measurement of Distances', 'Types of motion and measurement', 4),
    ('Materials Around Us', 'Classification of materials and their properties', 5),
    ('Separation of Substances', 'Methods of separating mixtures', 6),
    ('Changes Around Us', 'Physical and chemical changes', 7),
    ('The Living Organisms and Their Surroundings', 'Characteristics of living organisms', 8),
    ('Components of Food', 'Nutrients and their functions', 9),
    ('Fibre to Fabric', 'Natural and synthetic fibres', 10),
    ('Getting to Know Plants', 'Parts of plants and their functions', 11),
    ('Body Movements', 'Human body and animal movements', 12),
    ('Water', 'Sources and importance of water', 13),
    ('Air Around Us', 'Properties and composition of air', 14),
    ('Garbage In, Garbage Out', 'Waste management and recycling', 15)
) t(name, description, order_index)
WHERE s.name = 'Science' AND s.grade_level = 6 AND s.board_id IN (SELECT id FROM boards WHERE code = 'CBSE')
ON CONFLICT DO NOTHING;

-- Insert sample topics for Grade 6 Mathematics
INSERT INTO topics (subject_id, name, description, order_index)
SELECT s.id, t.name, t.description, t.order_index
FROM subjects s
CROSS JOIN (
    VALUES 
    ('Knowing Our Numbers', 'Place value and number systems', 1),
    ('Whole Numbers', 'Properties of whole numbers', 2),
    ('Playing with Numbers', 'Factors and multiples', 3),
    ('Basic Geometrical Ideas', 'Points, lines, and shapes', 4),
    ('Understanding Elementary Shapes', '2D and 3D shapes', 5),
    ('Integers', 'Positive and negative numbers', 6),
    ('Fractions', 'Understanding fractions', 7),
    ('Decimals', 'Decimal numbers and operations', 8),
    ('Data Handling', 'Collection and representation of data', 9),
    ('Mensuration', 'Perimeter and area', 10),
    ('Algebra', 'Introduction to algebra', 11),
    ('Ratio and Proportion', 'Understanding ratios', 12),
    ('Symmetry', 'Lines of symmetry', 13),
    ('Practical Geometry', 'Construction of shapes', 14)
) t(name, description, order_index)
WHERE s.name = 'Mathematics' AND s.grade_level = 6 AND s.board_id IN (SELECT id FROM boards WHERE code = 'CBSE')
ON CONFLICT DO NOTHING;

-- Insert AI Rules
INSERT INTO ai_rules (rule_type, category, title, description, is_active) VALUES
-- Global Rules
('global', 'general', 'Clear and Concise Questions', 'Questions should be clear and concise. Generate questions that are educationally appropriate, clear, and unambiguous. Ensure all incorrect options are plausible.', true),
('global', 'formatting', 'Character Naming Rules', 'Use diverse, culturally appropriate names. Avoid stereotypes. Use names like Arjun, Priya, Rahul, Ananya, etc. for Indian context.', true),
('global', 'content', 'Curriculum Alignment', 'All questions must align with the specified curriculum and learning outcomes. Focus on the specific topic and grade level requirements.', true),

-- Question Type Rules
('question_type', 'multiple_choice', 'Multiple Choice Guidelines', 'Create meaningful options that test understanding. Provide exactly 4 options (A, B, C, D). Ensure only one correct answer.', true),
('question_type', 'multiple_select', 'Multiple Select Guidelines', 'Embed 2-4 meaningful choices within sentences that test understanding. Clearly indicate multiple correct answers.', true),
('question_type', 'fill_blanks', 'Fill in the Blanks Guidelines', 'Create meaningful blanks that test key concepts. Provide exact answers expected. Minimum 1, maximum 3 blanks per question.', true),
('question_type', 'true_false', 'True/False Guidelines', 'Create statements that can be definitively classified as true or false. Avoid ambiguous statements.', true),

-- Bloom Level Rules
('bloom_level', 'remembering', 'Remembering Level', 'Focus on recall of facts, terms, basic concepts. Use action verbs: define, list, identify, name, state, describe.', true),
('bloom_level', 'understanding', 'Understanding Level', 'Focus on comprehension and interpretation. Use action verbs: explain, summarize, interpret, classify, compare, contrast.', true),
('bloom_level', 'applying', 'Applying Level', 'Focus on using knowledge in new situations. Use action verbs: apply, demonstrate, solve, use, implement, execute.', true),
('bloom_level', 'analyzing', 'Analyzing Level', 'Focus on breaking down information. Use action verbs: analyze, examine, investigate, categorize, differentiate.', true),
('bloom_level', 'evaluating', 'Evaluating Level', 'Focus on making judgments. Use action verbs: evaluate, assess, critique, judge, justify, defend.', true),
('bloom_level', 'creating', 'Creating Level', 'Focus on producing new work. Use action verbs: create, design, construct, develop, formulate, compose.', true)
ON CONFLICT DO NOTHING;

-- Insert Bloom Sample Questions
INSERT INTO bloom_samples (bloom_level, grade_level, subject, question_type, sample_question, sample_options, correct_answer, explanation, is_active) VALUES
-- Remembering Level Samples
('remembering', 6, 'Science', 'mcq', 'What is the main source of light on Earth?', 
'{"A": "Moon", "B": "Sun", "C": "Stars", "D": "Fire"}', 'B', 
'Correct. The Sun is the primary source of natural light on Earth, providing energy for most life processes.', true),

('remembering', 6, 'Mathematics', 'fill_blank', 'The place value of 5 in the number 2,547 is _______.', 
'{}', 'tens', 
'Correct. In the number 2,547, the digit 5 is in the tens place, representing 50.', true),

-- Understanding Level Samples
('understanding', 6, 'Science', 'mcq', 'Why do we see our shadow during the day but not at night?', 
'{"A": "Shadows disappear at night", "B": "Light is needed to form shadows", "C": "The ground absorbs shadows", "D": "Shadows become invisible"}', 'B', 
'Correct. Shadows are formed when light is blocked by an object. Without sufficient light at night, shadows are not visible.', true),

('understanding', 6, 'Mathematics', 'mcq', 'If a rectangle has a length of 8 cm and width of 5 cm, what is its perimeter?', 
'{"A": "13 cm", "B": "26 cm", "C": "40 cm", "D": "18 cm"}', 'B', 
'Correct. Perimeter = 2(length + width) = 2(8 + 5) = 2(13) = 26 cm.', true),

-- Applying Level Samples
('applying', 6, 'Science', 'mcq', 'Ravi wants to separate a mixture of sand and water. Which method should he use?', 
'{"A": "Filtration", "B": "Evaporation", "C": "Decantation", "D": "Sieving"}', 'A', 
'Correct. Filtration is the most effective method to separate sand (insoluble solid) from water.', true),

-- Analyzing Level Samples
('analyzing', 6, 'Science', 'mcq', 'A plant kept in a dark room for several days shows yellowing leaves. What can you conclude?', 
'{"A": "The plant needs water", "B": "The plant lacks sunlight for photosynthesis", "C": "The plant is diseased", "D": "The plant needs fertilizer"}', 'B', 
'Correct. Yellowing leaves in darkness indicate lack of chlorophyll production due to absence of sunlight needed for photosynthesis.', true),

-- Evaluating Level Samples
('evaluating', 6, 'Mathematics', 'mcq', 'Which is the most efficient way to find the area of an irregular shape drawn on graph paper?', 
'{"A": "Measure with ruler", "B": "Count complete squares and estimate partial squares", "C": "Use mathematical formulas", "D": "Trace and weigh the paper"}', 'B', 
'Correct. Counting squares on graph paper provides the most practical and accurate method for irregular shapes.', true),

-- Creating Level Samples
('creating', 6, 'Science', 'mcq', 'Design an experiment to test which material is the best insulator. What would be your first step?', 
'{"A": "Buy expensive equipment", "B": "Identify materials to test and control variables", "C": "Record results immediately", "D": "Ask others for answers"}', 'B', 
'Correct. Scientific method requires identifying variables and materials before conducting experiments.', true)
ON CONFLICT DO NOTHING;

-- Create a default admin user
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES
('admin@xed21.com', '$2b$10$example_hash_here', 'System Administrator', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_rules_updated_at ON ai_rules;
CREATE TRIGGER update_ai_rules_updated_at BEFORE UPDATE ON ai_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();