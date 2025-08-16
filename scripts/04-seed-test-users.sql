-- Create test users with specific credentials
-- Note: Supabase handles password hashing automatically through auth.signUp()

-- Insert test user data (will be linked to Supabase auth users)
INSERT INTO users (id, email, full_name, role, organization, phone, wallet_balance, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'geology.cupb16@gmail.com', 'Test User', 'educator', 'Demo Organization', '+1234567890', 100, true, now(), now())
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  organization = EXCLUDED.organization,
  phone = EXCLUDED.phone,
  wallet_balance = EXCLUDED.wallet_balance,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Insert admin user data
INSERT INTO admin_users (id, email, full_name, role, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'hassan.jobs07@gmail.com', 'Admin User', 'super_admin', true, now(), now())
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();
