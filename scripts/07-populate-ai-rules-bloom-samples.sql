-- Create AI Rules table if not exists
CREATE TABLE IF NOT EXISTS ai_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_type VARCHAR(50) NOT NULL, -- 'global', 'question_type', 'bloom_level'
    category VARCHAR(100) NOT NULL, -- 'general', 'multiple_choice', 'remembering', etc.
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Bloom Samples table if not exists
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
('question_type', 'inline_choice', 'In-Line Choice Guidelines', 'Embed 2-3 meaningful choices within sentences that test understanding. Use brackets to indicate choices.', true),
('question_type', 'matching', 'Matching Guidelines', 'Create items from two columns that need to be matched. Provide 4-6 items per column. Ensure clear relationships.', true),
('question_type', 'true_false', 'True/False Guidelines', 'Create statements that can be definitively classified as true or false. Avoid ambiguous statements.', true),

-- Bloom Level Rules
('bloom_level', 'remembering', 'Remembering Level', 'Focus on recall of facts, terms, basic concepts. Use action verbs: define, list, identify, name, state, describe.', true),
('bloom_level', 'understanding', 'Understanding Level', 'Focus on comprehension and interpretation. Use action verbs: explain, summarize, interpret, classify, compare, contrast.', true),
('bloom_level', 'applying', 'Applying Level', 'Focus on using knowledge in new situations. Use action verbs: apply, demonstrate, solve, use, implement, execute.', true),
('bloom_level', 'analyzing', 'Analyzing Level', 'Focus on breaking down information. Use action verbs: analyze, examine, investigate, categorize, differentiate.', true),
('bloom_level', 'evaluating', 'Evaluating Level', 'Focus on making judgments. Use action verbs: evaluate, assess, critique, judge, justify, defend.', true),
('bloom_level', 'creating', 'Creating Level', 'Focus on producing new work. Use action verbs: create, design, construct, develop, formulate, compose.', true);

-- Insert Bloom Sample Questions
INSERT INTO bloom_samples (bloom_level, grade_level, subject, question_type, sample_question, sample_options, correct_answer, explanation, is_active) VALUES
-- Remembering Level Samples
('remembering', 6, 'Science', 'multiple_choice', 'What is the main source of light on Earth?', 
'{"A": "Moon", "B": "Sun", "C": "Stars", "D": "Fire"}', 'B', 
'Correct. The Sun is the primary source of natural light on Earth, providing energy for most life processes.', true),

('remembering', 6, 'Mathematics', 'fill_blanks', 'The place value of 5 in the number 2,547 is _______.', 
'{}', 'tens', 
'Correct. In the number 2,547, the digit 5 is in the tens place, representing 50.', true),

-- Understanding Level Samples
('understanding', 6, 'Science', 'multiple_choice', 'Why do we see our shadow during the day but not at night?', 
'{"A": "Shadows disappear at night", "B": "Light is needed to form shadows", "C": "The ground absorbs shadows", "D": "Shadows become invisible"}', 'B', 
'Correct. Shadows are formed when light is blocked by an object. Without sufficient light at night, shadows are not visible.', true),

('understanding', 6, 'Mathematics', 'multiple_choice', 'If a rectangle has a length of 8 cm and width of 5 cm, what is its perimeter?', 
'{"A": "13 cm", "B": "26 cm", "C": "40 cm", "D": "18 cm"}', 'B', 
'Correct. Perimeter = 2(length + width) = 2(8 + 5) = 2(13) = 26 cm.', true),

-- Applying Level Samples
('applying', 6, 'Science', 'multiple_choice', 'Ravi wants to separate a mixture of sand and water. Which method should he use?', 
'{"A": "Filtration", "B": "Evaporation", "C": "Decantation", "D": "Sieving"}', 'A', 
'Correct. Filtration is the most effective method to separate sand (insoluble solid) from water.', true),

-- Analyzing Level Samples
('analyzing', 6, 'Science', 'multiple_choice', 'A plant kept in a dark room for several days shows yellowing leaves. What can you conclude?', 
'{"A": "The plant needs water", "B": "The plant lacks sunlight for photosynthesis", "C": "The plant is diseased", "D": "The plant needs fertilizer"}', 'B', 
'Correct. Yellowing leaves in darkness indicate lack of chlorophyll production due to absence of sunlight needed for photosynthesis.', true),

-- Evaluating Level Samples
('evaluating', 6, 'Mathematics', 'multiple_choice', 'Which is the most efficient way to find the area of an irregular shape drawn on graph paper?', 
'{"A": "Measure with ruler", "B": "Count complete squares and estimate partial squares", "C": "Use mathematical formulas", "D": "Trace and weigh the paper"}', 'B', 
'Correct. Counting squares on graph paper provides the most practical and accurate method for irregular shapes.', true),

-- Creating Level Samples
('creating', 6, 'Science', 'multiple_choice', 'Design an experiment to test which material is the best insulator. What would be your first step?', 
'{"A": "Buy expensive equipment", "B": "Identify materials to test and control variables", "C": "Record results immediately", "D": "Ask others for answers"}', 'B', 
'Correct. Scientific method requires identifying variables and materials before conducting experiments.', true);
