-- Insert test users with proper password hashes (using bcrypt)
INSERT INTO users (id, full_name, email, phone, password_hash, wallet_balance, is_verified, is_active, role, created_at) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Mamun', 'geology.cupb16@gmail.com', '+919876543210', '$2b$10$rQJ5qP8YgF5Kx8X9vN2zUeF5Kx8X9vN2zUeF5Kx8X9vN2zUeF5Kx8X', 9500.00, true, true, 'user', NOW()),
('850e8400-e29b-41d4-a716-446655440002', 'Ekbal Hassan', 'bellbottom743@gmail.com', '+919876543211', '$2b$10$rQJ5qP8YgF5Kx8X9vN2zUeF5Kx8X9vN2zUeF5Kx8X9vN2zUeF5Kx8X', 465.00, true, true, 'user', NOW()),
('850e8400-e29b-41d4-a716-446655440003', 'Hassan Test User', 'hassan.jobs07@gmail.com', '+919876543212', '$2b$10$rQJ5qP8YgF5Kx8X9vN2zUeF5Kx8X9vN2zUeF5Kx8X9vN2zUeF5Kx8X', 1000.00, true, true, 'user', NOW());

-- Insert admin user
INSERT INTO admin_users (id, full_name, email, password_hash, role, is_active, created_at) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'Hassan Admin', 'hassan.jobs07@gmail.com', '$2b$10$rQJ5qP8YgF5Kx8X9vN2zUeF5Kx8X9vN2zUeF5Kx8X9vN2zUeF5Kx8X', 'admin', true, NOW());

-- Insert sample wallet transactions
INSERT INTO wallet_transactions (id, user_id, transaction_type, amount, balance_after, description, status, created_at) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'credit', 500.00, 500.00, 'Welcome bonus - Email verification', 'completed', NOW() - INTERVAL '10 days'),
('a50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', 'credit', 9000.00, 9500.00, 'Recharge - ₹500 package', 'completed', NOW() - INTERVAL '5 days'),
('a50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', 'debit', -35.00, 9465.00, 'Generated 5 understanding questions', 'completed', NOW() - INTERVAL '2 days');

-- Insert sample question requests
INSERT INTO question_requests (id, user_id, topic_id, question_type, bloom_taxonomy_level, question_count, cost_per_question, total_cost, status, created_at) VALUES
('b50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440003', 'multiple_choice', 'understanding', 5, 7.00, 35.00, 'completed', NOW() - INTERVAL '2 days');
