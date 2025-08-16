-- Insert Indian education boards
INSERT INTO boards (name, code, description) VALUES
('National Council of Educational Research and Training', 'NCERT', 'Central board following NCERT curriculum'),
('Central Board of Secondary Education', 'CBSE', 'Central board of secondary education'),
('Indian Certificate of Secondary Education', 'ICSE', 'Indian certificate of secondary education'),
('Maharashtra State Board', 'MSBSHSE', 'Maharashtra state board of secondary and higher secondary education'),
('Tamil Nadu State Board', 'TNBSE', 'Tamil Nadu board of secondary education'),
('Karnataka State Board', 'KSEEB', 'Karnataka secondary education examination board'),
('West Bengal Board', 'WBBSE', 'West Bengal board of secondary education'),
('Uttar Pradesh Board', 'UPMSP', 'Uttar Pradesh Madhyamik Shiksha Parishad');

-- Insert core subjects for different grades (focusing on NCERT/CBSE initially)
INSERT INTO subjects (board_id, name, code, grade_level) 
SELECT b.id, s.name, s.code, s.grade_level
FROM boards b
CROSS JOIN (
    VALUES 
    ('Mathematics', 'MATH', 1), ('Mathematics', 'MATH', 2), ('Mathematics', 'MATH', 3),
    ('Mathematics', 'MATH', 4), ('Mathematics', 'MATH', 5), ('Mathematics', 'MATH', 6),
    ('Mathematics', 'MATH', 7), ('Mathematics', 'MATH', 8), ('Mathematics', 'MATH', 9),
    ('Mathematics', 'MATH', 10), ('Mathematics', 'MATH', 11), ('Mathematics', 'MATH', 12),
    
    ('Science', 'SCI', 1), ('Science', 'SCI', 2), ('Science', 'SCI', 3),
    ('Science', 'SCI', 4), ('Science', 'SCI', 5), ('Science', 'SCI', 6),
    ('Science', 'SCI', 7), ('Science', 'SCI', 8),
    
    ('Physics', 'PHY', 9), ('Physics', 'PHY', 10), ('Physics', 'PHY', 11), ('Physics', 'PHY', 12),
    ('Chemistry', 'CHEM', 9), ('Chemistry', 'CHEM', 10), ('Chemistry', 'CHEM', 11), ('Chemistry', 'CHEM', 12),
    ('Biology', 'BIO', 9), ('Biology', 'BIO', 10), ('Biology', 'BIO', 11), ('Biology', 'BIO', 12),
    
    ('English', 'ENG', 1), ('English', 'ENG', 2), ('English', 'ENG', 3),
    ('English', 'ENG', 4), ('English', 'ENG', 5), ('English', 'ENG', 6),
    ('English', 'ENG', 7), ('English', 'ENG', 8), ('English', 'ENG', 9),
    ('English', 'ENG', 10), ('English', 'ENG', 11), ('English', 'ENG', 12),
    
    ('Hindi', 'HIN', 1), ('Hindi', 'HIN', 2), ('Hindi', 'HIN', 3),
    ('Hindi', 'HIN', 4), ('Hindi', 'HIN', 5), ('Hindi', 'HIN', 6),
    ('Hindi', 'HIN', 7), ('Hindi', 'HIN', 8), ('Hindi', 'HIN', 9),
    ('Hindi', 'HIN', 10), ('Hindi', 'HIN', 11), ('Hindi', 'HIN', 12),
    
    ('Social Science', 'SST', 6), ('Social Science', 'SST', 7), ('Social Science', 'SST', 8),
    ('Social Science', 'SST', 9), ('Social Science', 'SST', 10),
    
    ('History', 'HIST', 11), ('History', 'HIST', 12),
    ('Geography', 'GEO', 11), ('Geography', 'GEO', 12),
    ('Political Science', 'POL', 11), ('Political Science', 'POL', 12),
    ('Economics', 'ECO', 11), ('Economics', 'ECO', 12)
) s(name, code, grade_level)
WHERE b.code IN ('NCERT', 'CBSE');

-- Insert sample topics for Mathematics Grade 10
INSERT INTO topics (subject_id, name, description, order_index)
SELECT s.id, t.name, t.description, t.order_index
FROM subjects s
CROSS JOIN (
    VALUES 
    ('Real Numbers', 'Introduction to real numbers, rational and irrational numbers', 1),
    ('Polynomials', 'Polynomials and their zeros, relationship between zeros and coefficients', 2),
    ('Pair of Linear Equations in Two Variables', 'Solving systems of linear equations', 3),
    ('Quadratic Equations', 'Quadratic equations and their solutions', 4),
    ('Arithmetic Progressions', 'Arithmetic sequences and series', 5),
    ('Triangles', 'Similarity of triangles and their properties', 6),
    ('Coordinate Geometry', 'Distance formula, section formula, area of triangle', 7),
    ('Introduction to Trigonometry', 'Trigonometric ratios and identities', 8),
    ('Some Applications of Trigonometry', 'Heights and distances problems', 9),
    ('Circles', 'Tangents to circles and their properties', 10),
    ('Areas Related to Circles', 'Area and perimeter of circles and sectors', 11),
    ('Surface Areas and Volumes', 'Surface area and volume of solids', 12),
    ('Statistics', 'Mean, median, mode of grouped data', 13),
    ('Probability', 'Basic concepts of probability', 14)
) t(name, description, order_index)
WHERE s.name = 'Mathematics' AND s.grade_level = 10 AND s.board_id IN (SELECT id FROM boards WHERE code IN ('NCERT', 'CBSE'));

-- Create a default admin user (password should be hashed in real implementation)
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES
('admin@xed21.com', '$2b$10$example_hash_here', 'System Administrator', 'super_admin');
