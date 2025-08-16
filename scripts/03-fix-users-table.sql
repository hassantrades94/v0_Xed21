-- Remove password_hash constraint and make it nullable since Supabase handles auth
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Add trigger to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, organization, phone, wallet_balance, is_active, is_verified)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'educator'),
    new.raw_user_meta_data->>'organization',
    new.raw_user_meta_data->>'phone',
    COALESCE((new.raw_user_meta_data->>'wallet_balance')::integer, 100),
    true,
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically handle user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
