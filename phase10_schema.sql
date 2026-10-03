-- ====================================================================================
-- Hostel Management System - Phase 10 Schema (Notices & Notifications)
-- ====================================================================================

-- 1. Create the NOTICES table
CREATE TABLE public.notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT DEFAULT 'all' NOT NULL, -- e.g., 'all', 'student', 'worker_problem', 'cook', 'accountant'
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Anyone can view notices targeted to 'all' or to their specific role
CREATE POLICY "Users can view relevant notices" 
ON public.notices FOR SELECT 
USING (
  target_audience = 'all' OR 
  target_audience = (auth.jwt() -> 'user_metadata' ->> 'role') OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Only Admins can create, update, or delete notices
CREATE POLICY "Admins can manage notices" 
ON public.notices FOR ALL 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
