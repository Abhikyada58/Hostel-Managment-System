-- ====================================================================================
-- Hostel Management System - Phase 1 Schema (Users & Authentication)
-- ====================================================================================

-- 1. Create a custom enum for user roles
CREATE TYPE user_role AS ENUM (
  'student', 
  'worker_problem', 
  'worker_laundry', 
  'cook', 
  'accountant', 
  'admin'
);

-- 2. Create a custom enum for account status
CREATE TYPE account_status AS ENUM (
  'active', 
  'inactive', 
  'blocked'
);

-- 3. Create the PROFILES table
-- This table automatically links to Supabase's built-in auth.users table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  room_number TEXT,
  role user_role DEFAULT 'student'::user_role NOT NULL,
  status account_status DEFAULT 'active'::account_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for profiles

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 3: Allow users to insert their own profile during signup/registration
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can update any profile
CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 5: Users can update their own non-role/non-status fields
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  -- Note: In a production app, we would write a trigger to prevent users from updating their own 'role' or 'status'.
);

-- ====================================================================================
-- Trigger to automatically create a profile when a new auth user signs up
-- ====================================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, status)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
    new.email, 
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
    'active'::account_status
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
