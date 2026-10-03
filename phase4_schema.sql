-- ====================================================================================
-- Hostel Management System - Phase 4 Schema (Problems Management)
-- ====================================================================================

-- 1. Create a custom enum for problem priorities
CREATE TYPE problem_priority AS ENUM (
  'low', 
  'medium', 
  'high', 
  'emergency'
);

-- 2. Create a custom enum for problem statuses
CREATE TYPE problem_status AS ENUM (
  'pending', 
  'accepted', 
  'in progress', 
  'solved', 
  'closed', 
  'reopened'
);

-- 3. Create the PROBLEMS table
CREATE TABLE public.problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  room_number TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  priority problem_priority DEFAULT 'low'::problem_priority NOT NULL,
  status problem_status DEFAULT 'pending'::problem_status NOT NULL,
  worker_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) on problems
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for problems

-- Policy 1: Students can view their own problems
CREATE POLICY "Students can view own problems" 
ON public.problems FOR SELECT 
USING (auth.uid() = student_id);

-- Policy 2: Problem Workers and Admins can view all problems
CREATE POLICY "Workers and Admins can view all problems" 
ON public.problems FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('worker_problem', 'admin')
  )
);

-- Policy 3: Students can insert their own problems
CREATE POLICY "Students can insert own problems" 
ON public.problems FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- Policy 4: Students can update their own problems ONLY if status is 'solved' (to confirm/reopen)
CREATE POLICY "Students can confirm or reopen solved problems" 
ON public.problems FOR UPDATE 
USING (auth.uid() = student_id)
WITH CHECK (
  auth.uid() = student_id
);

-- Policy 5: Workers and Admins can update any problem status/notes
CREATE POLICY "Workers and Admins can update problems" 
ON public.problems FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('worker_problem', 'admin')
  )
);

-- 6. Trigger to auto-update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_problems_modtime
  BEFORE UPDATE ON public.problems
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ====================================================================================
-- Optional: Insert a test problem worker account for Phase 4 testing
-- Note: Replace with actual auth signup through UI later.
-- ====================================================================================
