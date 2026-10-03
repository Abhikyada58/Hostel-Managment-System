-- ====================================================================================
-- Hostel Management System - Phase 6 Schema (Laundry Management)
-- ====================================================================================

-- 1. Create enum for laundry request status
CREATE TYPE laundry_status AS ENUM (
  'pending_pickup', 
  'washing', 
  'ready_for_delivery', 
  'delivered', 
  'completed'
);

-- 2. Create the LAUNDRY_REQUESTS table
CREATE TABLE public.laundry_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  room_number TEXT NOT NULL,
  clothes_count INTEGER NOT NULL,
  notes TEXT,
  status laundry_status DEFAULT 'pending_pickup'::laundry_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.laundry_requests ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Policy 1: Students can view their own requests
CREATE POLICY "Students can view own laundry requests" 
ON public.laundry_requests FOR SELECT 
USING (auth.uid() = student_id);

-- Policy 2: Workers and Admins can view all requests
CREATE POLICY "Workers and Admins can view all laundry requests" 
ON public.laundry_requests FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('worker_laundry', 'admin')
  )
);

-- Policy 3: Students can insert their own requests
CREATE POLICY "Students can insert own laundry requests" 
ON public.laundry_requests FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- Policy 4: Students can update their own request ONLY to confirm completion
CREATE POLICY "Students can confirm completed laundry requests" 
ON public.laundry_requests FOR UPDATE 
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- Policy 5: Workers and Admins can update laundry request statuses
CREATE POLICY "Workers and Admins can update laundry requests" 
ON public.laundry_requests FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('worker_laundry', 'admin')
  )
);
