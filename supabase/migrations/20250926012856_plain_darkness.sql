/*
# Complete Supabase Database Setup for Xed21

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

## Data Seeded
- Indian education boards (CBSE, ICSE, State Boards)
- Complete subject structure for all grades
- Sample topics for multiple subjects
- AI generation rules
- Bloom's taxonomy sample questions
- Test users and admin accounts
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_boards_code ON boards(code);
CREATE INDEX IF NOT EXISTS idx_subjects_board_id ON subjects(board_id);
CREATE INDEX IF NOT EXISTS idx_subjects_grade_level ON subjects(grade_level);
CREATE INDEX IF NOT EXISTS idx_topics_parent_topic_id ON topics(parent_topic_id);

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
CREATE POLICY "Service role can manage users" ON users FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for questions table
CREATE POLICY "Users can read own questions" ON questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create questions" ON questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage questions" ON questions FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for wallet transactions
CREATE POLICY "Users can read own transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage transactions" ON wallet_transactions FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for question requests
CREATE POLICY "Users can read own requests" ON question_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create requests" ON question_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage requests" ON question_requests FOR ALL USING (auth.role() = 'service_role');

-- Public read access for educational content
CREATE POLICY "Public read access for boards" ON boards FOR SELECT USING (true);
CREATE POLICY "Public read access for subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read access for topics" ON topics FOR SELECT USING (true);

-- Admin policies (service role access)
CREATE POLICY "Service role full access to admin_users" ON admin_users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to ai_rules" ON ai_rules FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to bloom_samples" ON bloom_samples FOR ALL USING (auth.role() = 'service_role');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_rules_updated_at ON ai_rules;
CREATE TRIGGER update_ai_rules_updated_at BEFORE UPDATE ON ai_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_boards_updated_at ON boards;
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_topics_updated_at ON topics;
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Insert subjects for ICSE/CISCE
INSERT INTO subjects (board_id, name, code, grade_level) 
SELECT b.id, s.name, s.code, s.grade_level
FROM boards b
CROSS JOIN (
    VALUES 
    -- Grade 1-5 subjects
    ('English', 'ENG', 1), ('Hindi', 'HIN', 1), ('Mathematics', 'MAT', 1), ('Environmental Science', 'EVS', 1),
    ('English', 'ENG', 2), ('Hindi', 'HIN', 2), ('Mathematics', 'MAT', 2), ('Environmental Science', 'EVS', 2),
    ('English', 'ENG', 3), ('Hindi', 'HIN', 3), ('Mathematics', 'MAT', 3), ('Environmental Science', 'EVS', 3),
    ('English', 'ENG', 4), ('Hindi', 'HIN', 4), ('Mathematics', 'MAT', 4), ('Environmental Science', 'EVS', 4),
    ('English', 'ENG', 5), ('Hindi', 'HIN', 5), ('Mathematics', 'MAT', 5), ('Environmental Science', 'EVS', 5),
    
    -- Grade 6-8 subjects
    ('English', 'ENG', 6), ('Mathematics', 'MAT', 6), ('Physics', 'PHY', 6), ('Chemistry', 'CHE', 6), ('Biology', 'BIO', 6), ('History', 'HIS', 6), ('Geography', 'GEO', 6),
    ('English', 'ENG', 7), ('Mathematics', 'MAT', 7), ('Physics', 'PHY', 7), ('Chemistry', 'CHE', 7), ('Biology', 'BIO', 7), ('History', 'HIS', 7), ('Geography', 'GEO', 7),
    ('English', 'ENG', 8), ('Mathematics', 'MAT', 8), ('Physics', 'PHY', 8), ('Chemistry', 'CHE', 8), ('Biology', 'BIO', 8), ('History', 'HIS', 8), ('Geography', 'GEO', 8),
    
    -- Grade 9-10 subjects
    ('English', 'ENG', 9), ('Mathematics', 'MAT', 9), ('Physics', 'PHY', 9), ('Chemistry', 'CHE', 9), ('Biology', 'BIO', 9), ('History', 'HIS', 9), ('Geography', 'GEO', 9),
    ('English', 'ENG', 10), ('Mathematics', 'MAT', 10), ('Physics', 'PHY', 10), ('Chemistry', 'CHE', 10), ('Biology', 'BIO', 10), ('History', 'HIS', 10), ('Geography', 'GEO', 10),
    
    -- Grade 11-12 subjects
    ('Physics', 'PHY', 11), ('Chemistry', 'CHE', 11), ('Biology', 'BIO', 11), ('Mathematics', 'MAT', 11), ('English', 'ENG', 11),
    ('History', 'HIS', 11), ('Geography', 'GEO', 11), ('Political Science', 'POL', 11), ('Economics', 'ECO', 11), ('Commerce', 'COM', 11),
    ('Physics', 'PHY', 12), ('Chemistry', 'CHE', 12), ('Biology', 'BIO', 12), ('Mathematics', 'MAT', 12), ('English', 'ENG', 12),
    ('History', 'HIS', 12), ('Geography', 'GEO', 12), ('Political Science', 'POL', 12), ('Economics', 'ECO', 12), ('Commerce', 'COM', 12)
) s(name, code, grade_level)
WHERE b.code = 'ICSE'
ON CONFLICT (board_id, code, grade_level) DO NOTHING;

-- Insert comprehensive topics for Grade 6 Science (CBSE)
INSERT INTO topics (subject_id, name, description, order_index)
SELECT s.id, t.name, t.description, t.order_index
FROM subjects s
CROSS JOIN (
    VALUES 
    ('Light, Shadows and Reflections', 'Understanding light sources, shadows, and reflection. Light travels in straight lines and forms shadows when blocked by opaque objects. Mirrors reflect light and form images.', 1),
    ('Electricity and Circuits', 'Basic concepts of electricity and simple circuits. Electric current flows through conductors. Simple circuits with batteries, bulbs, and switches.', 2),
    ('Fun with Magnets', 'Properties and uses of magnets. Magnetic poles, attraction and repulsion, magnetic materials, and compass navigation.', 3),
    ('Motion and Measurement of Distances', 'Types of motion and measurement. Linear, circular, and oscillatory motion. Standard units of measurement and measuring instruments.', 4),
    ('Materials Around Us', 'Classification of materials and their properties. Metals, non-metals, natural and synthetic materials, and their characteristics.', 5),
    ('Separation of Substances', 'Methods of separating mixtures. Filtration, evaporation, sedimentation, decantation, and magnetic separation techniques.', 6),
    ('Changes Around Us', 'Physical and chemical changes. Reversible and irreversible changes, rusting, burning, and cooking as examples.', 7),
    ('The Living Organisms and Their Surroundings', 'Characteristics of living organisms. Habitat, adaptation, and the relationship between organisms and their environment.', 8),
    ('Components of Food', 'Nutrients and their functions. Carbohydrates, proteins, fats, vitamins, minerals, and water. Balanced diet and deficiency diseases.', 9),
    ('Fibre to Fabric', 'Natural and synthetic fibres. Cotton, wool, silk production. Synthetic fibres like nylon and polyester.', 10),
    ('Getting to Know Plants', 'Parts of plants and their functions. Roots, stems, leaves, flowers, and fruits. Photosynthesis and plant nutrition.', 11),
    ('Body Movements', 'Human body and animal movements. Bones, joints, muscles, and different types of movements in animals.', 12),
    ('Water', 'Sources and importance of water. Water cycle, conservation, and purification methods. Water pollution and its prevention.', 13),
    ('Air Around Us', 'Properties and composition of air. Oxygen, carbon dioxide, nitrogen. Air pollution and its effects on health.', 14),
    ('Garbage In, Garbage Out', 'Waste management and recycling. Types of waste, composting, and reducing environmental impact.', 15)
) t(name, description, order_index)
WHERE s.name = 'Science' AND s.grade_level = 6 AND s.board_id IN (SELECT id FROM boards WHERE code = 'CBSE')
ON CONFLICT DO NOTHING;

-- Insert topics for Grade 6 Mathematics (CBSE)
INSERT INTO topics (subject_id, name, description, order_index)
SELECT s.id, t.name, t.description, t.order_index
FROM subjects s
CROSS JOIN (
    VALUES 
    ('Knowing Our Numbers', 'Place value and number systems. Reading and writing large numbers, comparing numbers, and understanding place value up to crores.', 1),
    ('Whole Numbers', 'Properties of whole numbers. Addition, subtraction, multiplication, and division of whole numbers. Number patterns.', 2),
    ('Playing with Numbers', 'Factors and multiples. Prime and composite numbers, HCF and LCM, divisibility rules.', 3),
    ('Basic Geometrical Ideas', 'Points, lines, and shapes. Line segments, rays, angles, triangles, quadrilaterals, and circles.', 4),
    ('Understanding Elementary Shapes', '2D and 3D shapes. Properties of triangles, quadrilaterals, circles, and three-dimensional objects.', 5),
    ('Integers', 'Positive and negative numbers. Number line, addition and subtraction of integers, applications in daily life.', 6),
    ('Fractions', 'Understanding fractions. Proper, improper, and mixed fractions. Addition and subtraction of fractions.', 7),
    ('Decimals', 'Decimal numbers and operations. Place value in decimals, addition, subtraction, and comparison of decimals.', 8),
    ('Data Handling', 'Collection and representation of data. Bar graphs, pictographs, and interpretation of data.', 9),
    ('Mensuration', 'Perimeter and area. Perimeter of rectangles and squares, area of rectangles and squares.', 10),
    ('Algebra', 'Introduction to algebra. Variables, expressions, and simple equations using matchstick patterns.', 11),
    ('Ratio and Proportion', 'Understanding ratios. Equivalent ratios, proportion, and unitary method.', 12),
    ('Symmetry', 'Lines of symmetry. Identifying symmetrical shapes and creating symmetrical patterns.', 13),
    ('Practical Geometry', 'Construction of shapes. Drawing circles, perpendicular bisectors, and angles using compass and ruler.', 14)
) t(name, description, order_index)
WHERE s.name = 'Mathematics' AND s.grade_level = 6 AND s.board_id IN (SELECT id FROM boards WHERE code = 'CBSE')
ON CONFLICT DO NOTHING;

-- Insert topics for Grade 10 Science (CBSE)
INSERT INTO topics (subject_id, name, description, order_index)
SELECT s.id, t.name, t.description, t.order_index
FROM subjects s
CROSS JOIN (
    VALUES 
    ('Light - Reflection and Refraction', 'Laws of reflection, spherical mirrors, refraction of light, lenses, and human eye.', 1),
    ('The Human Eye and Colourful World', 'Structure of human eye, defects of vision, dispersion of light, and atmospheric refraction.', 2),
    ('Electricity', 'Electric current, potential difference, resistance, Ohms law, and electrical power.', 3),
    ('Magnetic Effects of Electric Current', 'Magnetic field, electromagnetic induction, electric motor, and generator.', 4),
    ('Acids, Bases and Salts', 'Properties of acids and bases, pH scale, preparation and uses of salts.', 5),
    ('Metals and Non-metals', 'Physical and chemical properties, reactivity series, extraction of metals, and corrosion.', 6),
    ('Carbon and its Compounds', 'Covalent bonding, versatile nature of carbon, homologous series, and functional groups.', 7),
    ('Life Processes', 'Nutrition, respiration, transportation, and excretion in living organisms.', 8),
    ('Control and Coordination', 'Nervous system, hormones, coordination in plants, and tropic movements.', 9),
    ('How do Organisms Reproduce', 'Reproduction in animals and plants, sexual and asexual reproduction.', 10),
    ('Heredity and Evolution', 'Heredity, variation, evolution, and speciation.', 11),
    ('Our Environment', 'Ecosystem, food chains, ozone depletion, and waste management.', 12),
    ('Natural Resource Management', 'Conservation of forests, wildlife, water, coal, and petroleum.', 13)
) t(name, description, order_index)
WHERE s.name = 'Science' AND s.grade_level = 10 AND s.board_id IN (SELECT id FROM boards WHERE code = 'CBSE')
ON CONFLICT DO NOTHING;

-- Insert topics for Grade 10 Mathematics (CBSE)
INSERT INTO topics (subject_id, name, description, order_index)
SELECT s.id, t.name, t.description, t.order_index
FROM subjects s
CROSS JOIN (
    VALUES 
    ('Real Numbers', 'Euclids division lemma, fundamental theorem of arithmetic, rational and irrational numbers.', 1),
    ('Polynomials', 'Polynomials, zeros of polynomial, relationship between zeros and coefficients.', 2),
    ('Pair of Linear Equations in Two Variables', 'Linear equations, graphical and algebraic methods of solving equations.', 3),
    ('Quadratic Equations', 'Standard form, solution by factorization, completing square, and quadratic formula.', 4),
    ('Arithmetic Progressions', 'Arithmetic progression, nth term, sum of first n terms.', 5),
    ('Triangles', 'Similarity of triangles, criteria for similarity, areas of similar triangles.', 6),
    ('Coordinate Geometry', 'Distance formula, section formula, area of triangle using coordinates.', 7),
    ('Introduction to Trigonometry', 'Trigonometric ratios, trigonometric identities, and their applications.', 8),
    ('Some Applications of Trigonometry', 'Heights and distances, angle of elevation and depression.', 9),
    ('Circles', 'Tangent to circle, number of tangents from external point.', 10),
    ('Areas Related to Circles', 'Area of circle, sector, segment, and combinations of plane figures.', 11),
    ('Surface Areas and Volumes', 'Surface area and volume of cube, cuboid, cylinder, cone, and sphere.', 12),
    ('Statistics', 'Mean, median, mode of grouped data, cumulative frequency graph.', 13),
    ('Probability', 'Classical definition of probability, simple problems on probability.', 14)
) t(name, description, order_index)
WHERE s.name = 'Mathematics' AND s.grade_level = 10 AND s.board_id IN (SELECT id FROM boards WHERE code = 'CBSE')
ON CONFLICT DO NOTHING;

-- Insert AI Rules
INSERT INTO ai_rules (rule_type, category, title, description, is_active) VALUES
-- Global Rules
('global', 'general', 'Clear and Concise Questions', 'Questions should be clear and concise. Generate questions that are educationally appropriate, clear, and unambiguous. Ensure all incorrect options are plausible.', true),
('global', 'formatting', 'Character Naming Rules', 'Use diverse, culturally appropriate names. Avoid stereotypes. Use names like Arjun, Priya, Rahul, Ananya, etc. for Indian context.', true),
('global', 'content', 'Curriculum Alignment', 'All questions must align with the specified curriculum and learning outcomes. Focus on the specific topic and grade level requirements.', true),
('global', 'language', 'Indian Context', 'Use Indian context, examples, and scenarios. Reference Indian cities, festivals, food, and cultural elements where appropriate.', true),

-- Question Type Rules
('question_type', 'multiple_choice', 'Multiple Choice Guidelines', 'Create meaningful options that test understanding. Provide exactly 4 options (A, B, C, D). Ensure only one correct answer. Never use "All of the above" or "None of the above".', true),
('question_type', 'multiple_select', 'Multiple Select Guidelines', 'Create 6 options with 2-4 correct answers. Clearly indicate that multiple answers are correct. Provide detailed explanations for each option.', true),
('question_type', 'fill_blank', 'Fill in the Blanks Guidelines', 'Create meaningful blanks that test key concepts. Provide exact answers expected. Minimum 1, maximum 3 blanks per question.', true),
('question_type', 'inline_choice', 'In-Line Choice Guidelines', 'Embed 2-3 meaningful choices within sentences using brackets. Test understanding of specific concepts within context.', true),
('question_type', 'matching', 'Matching Guidelines', 'Create 4-6 items per column that need to be matched. Ensure clear relationships and avoid ambiguous matches.', true),
('question_type', 'true_false', 'True/False Guidelines', 'Create statements that can be definitively classified as true or false. Avoid ambiguous statements. Provide clear explanations.', true),

-- Bloom Level Rules
('bloom_level', 'remembering', 'Remembering Level', 'Focus on recall of facts, terms, basic concepts. Use action verbs: define, list, identify, name, state, describe. Cost: 5 coins per question.', true),
('bloom_level', 'understanding', 'Understanding Level', 'Focus on comprehension and interpretation. Use action verbs: explain, summarize, interpret, classify, compare, contrast. Cost: 7 coins per question.', true),
('bloom_level', 'applying', 'Applying Level', 'Focus on using knowledge in new situations. Use action verbs: apply, demonstrate, solve, use, implement, execute. Cost: 10 coins per question.', true),
('bloom_level', 'analyzing', 'Analyzing Level', 'Focus on breaking down information. Use action verbs: analyze, examine, investigate, categorize, differentiate. Cost: 15 coins per question.', true),
('bloom_level', 'evaluating', 'Evaluating Level', 'Focus on making judgments. Use action verbs: evaluate, assess, critique, judge, justify, defend. Cost: 25 coins per question.', true),
('bloom_level', 'creating', 'Creating Level', 'Focus on producing new work. Use action verbs: create, design, construct, develop, formulate, compose. Cost: 25 coins per question.', true)
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

('remembering', 10, 'Science', 'mcq', 'What is the SI unit of electric current?', 
'{"A": "Volt", "B": "Ampere", "C": "Ohm", "D": "Watt"}', 'B', 
'Correct. Ampere is the SI unit of electric current, named after André-Marie Ampère.', true),

-- Understanding Level Samples
('understanding', 6, 'Science', 'mcq', 'Why do we see our shadow during the day but not at night?', 
'{"A": "Shadows disappear at night", "B": "Light is needed to form shadows", "C": "The ground absorbs shadows", "D": "Shadows become invisible"}', 'B', 
'Correct. Shadows are formed when light is blocked by an object. Without sufficient light at night, shadows are not visible.', true),

('understanding', 6, 'Mathematics', 'mcq', 'If a rectangle has a length of 8 cm and width of 5 cm, what is its perimeter?', 
'{"A": "13 cm", "B": "26 cm", "C": "40 cm", "D": "18 cm"}', 'B', 
'Correct. Perimeter = 2(length + width) = 2(8 + 5) = 2(13) = 26 cm.', true),

('understanding', 10, 'Science', 'mcq', 'Why does a convex lens converge light rays?', 
'{"A": "It is thicker at edges", "B": "It is thicker at center", "C": "It absorbs light", "D": "It reflects light"}', 'B', 
'Correct. A convex lens is thicker at the center, causing light rays to bend inward and converge at the focal point.', true),

-- Applying Level Samples
('applying', 6, 'Science', 'mcq', 'Ravi wants to separate a mixture of sand and water. Which method should he use?', 
'{"A": "Filtration", "B": "Evaporation", "C": "Decantation", "D": "Sieving"}', 'A', 
'Correct. Filtration is the most effective method to separate sand (insoluble solid) from water.', true),

('applying', 10, 'Mathematics', 'mcq', 'A ladder 10m long reaches a window 8m high. How far is the foot of the ladder from the wall?', 
'{"A": "2m", "B": "4m", "C": "6m", "D": "18m"}', 'C', 
'Correct. Using Pythagoras theorem: distance² + 8² = 10², so distance² = 100 - 64 = 36, distance = 6m.', true),

-- Analyzing Level Samples
('analyzing', 6, 'Science', 'mcq', 'A plant kept in a dark room for several days shows yellowing leaves. What can you conclude?', 
'{"A": "The plant needs water", "B": "The plant lacks sunlight for photosynthesis", "C": "The plant is diseased", "D": "The plant needs fertilizer"}', 'B', 
'Correct. Yellowing leaves in darkness indicate lack of chlorophyll production due to absence of sunlight needed for photosynthesis.', true),

('analyzing', 10, 'Mathematics', 'mcq', 'Which method would be most efficient to solve the equation x² - 5x + 6 = 0?', 
'{"A": "Quadratic formula", "B": "Factorization", "C": "Completing the square", "D": "Graphical method"}', 'B', 
'Correct. This equation factors easily as (x-2)(x-3) = 0, making factorization the most efficient method.', true),

-- Evaluating Level Samples
('evaluating', 6, 'Mathematics', 'mcq', 'Which is the most efficient way to find the area of an irregular shape drawn on graph paper?', 
'{"A": "Measure with ruler", "B": "Count complete squares and estimate partial squares", "C": "Use mathematical formulas", "D": "Trace and weigh the paper"}', 'B', 
'Correct. Counting squares on graph paper provides the most practical and accurate method for irregular shapes.', true),

('evaluating', 10, 'Science', 'mcq', 'Which renewable energy source would be most suitable for a remote village in Rajasthan?', 
'{"A": "Hydroelectric", "B": "Wind energy", "C": "Solar energy", "D": "Geothermal"}', 'C', 
'Correct. Rajasthan receives abundant sunlight throughout the year, making solar energy the most practical choice.', true),

-- Creating Level Samples
('creating', 6, 'Science', 'mcq', 'Design an experiment to test which material is the best insulator. What would be your first step?', 
'{"A": "Buy expensive equipment", "B": "Identify materials to test and control variables", "C": "Record results immediately", "D": "Ask others for answers"}', 'B', 
'Correct. Scientific method requires identifying variables and materials before conducting experiments.', true),

('creating', 10, 'Mathematics', 'mcq', 'To design a circular garden with maximum area using 100m of fencing, what should be the radius?', 
'{"A": "15.92m", "B": "31.83m", "C": "50m", "D": "25m"}', 'A', 
'Correct. For a circle, circumference = 2πr = 100m, so r = 100/(2π) ≈ 15.92m gives maximum area.', true)
ON CONFLICT DO NOTHING;

-- Insert test users
INSERT INTO users (id, email, full_name, role, organization, phone, wallet_balance, is_verified, is_active, created_at, updated_at) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'geology.cupb16@gmail.com', 'Mamun', 'educator', 'Demo School', '+91 98765 43210', 9500.00, true, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440002', 'bellbottom743@gmail.com', 'Ekbal Hassan', 'educator', 'Test Institution', '+91 98765 43211', 465.00, true, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440003', 'hassan.jobs07@gmail.com', 'Hassan Test User', 'content_creator', 'Content Studio', '+91 98765 43212', 1000.00, true, true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  organization = EXCLUDED.organization,
  phone = EXCLUDED.phone,
  wallet_balance = EXCLUDED.wallet_balance,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Insert admin users
INSERT INTO admin_users (id, email, password_hash, full_name, role, is_active, created_at, updated_at) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'hassan.jobs07@gmail.com', '$2b$10$rQJ5qP8YgF5Kx8X9vN2zUeF5Kx8X9vN2zUeF5Kx8X9vN2zUeF5Kx8X', 'Hassan Admin', 'super_admin', true, NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440002', 'admin@xed21.com', '$2b$10$rQJ5qP8YgF5Kx8X9vN2zUeF5Kx8X9vN2zUeF5Kx8X9vN2zUeF5Kx8X', 'System Administrator', 'super_admin', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Insert sample wallet transactions
INSERT INTO wallet_transactions (id, user_id, transaction_type, amount, balance_after, description, status, created_at) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'credit', 500.00, 500.00, 'Welcome bonus - Email verification', 'completed', NOW() - INTERVAL '10 days'),
('a50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', 'credit', 9000.00, 9500.00, 'Recharge - ₹500 package', 'completed', NOW() - INTERVAL '5 days'),
('a50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', 'debit', 35.00, 9465.00, 'Generated 5 understanding questions', 'completed', NOW() - INTERVAL '2 days'),
('a50e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440002', 'credit', 500.00, 500.00, 'Welcome bonus - Email verification', 'completed', NOW() - INTERVAL '8 days'),
('a50e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440002', 'debit', 35.00, 465.00, 'Generated 5 understanding questions', 'completed', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Insert sample question requests
INSERT INTO question_requests (id, user_id, topic_id, question_type, difficulty_level, bloom_taxonomy_level, question_count, cost_per_question, total_cost, status, generated_questions_count, created_at, completed_at) VALUES
('b50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 
 (SELECT id FROM topics WHERE name = 'Fun with Magnets' LIMIT 1), 
 'mcq', 'medium', 'understanding', 5, 7.00, 35.00, 'completed', 5, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('b50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', 
 (SELECT id FROM topics WHERE name = 'Light, Shadows and Reflections' LIMIT 1), 
 'mcq', 'easy', 'remembering', 3, 5.00, 15.00, 'completed', 3, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Insert sample generated questions
INSERT INTO questions (id, user_id, topic_id, question_text, question_type, difficulty_level, options, correct_answer, explanation, bloom_taxonomy_level, estimated_time_minutes, is_approved, created_at, updated_at) VALUES
('c50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001',
 (SELECT id FROM topics WHERE name = 'Fun with Magnets' LIMIT 1),
 'Arjun conducted an experiment by placing a bar magnet over iron filings spread on a sheet of paper. He observed that most filings gathered at specific parts of the magnet. Where is the magnetic force strongest on the bar magnet?',
 'mcq', 'medium',
 '["A) At both ends", "B) At the center", "C) On the sides", "D) Evenly distributed"]',
 'A',
 'The magnetic force is strongest at the poles, which are located at both ends of the magnet. This is where the magnetic field lines are most concentrated.',
 'understanding', 2, true, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

('c50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002',
 (SELECT id FROM topics WHERE name = 'Light, Shadows and Reflections' LIMIT 1),
 'What happens when light falls on an opaque object?',
 'mcq', 'easy',
 '["A) It passes through", "B) It forms a shadow", "C) It disappears", "D) It changes color"]',
 'B',
 'Correct. When light falls on an opaque object, it cannot pass through and forms a shadow behind the object.',
 'remembering', 1, true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;