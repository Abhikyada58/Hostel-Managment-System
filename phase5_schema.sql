-- ====================================================================================
-- Hostel Management System - Phase 5 Schema (Item Requests)
-- ====================================================================================

-- 1. Create enum for item request status
CREATE TYPE item_status AS ENUM (
  'pending', 
  'accepted', 
  'preparing', 
  'delivered', 
  'completed'
);

-- 2. Create the ITEM_REQUESTS table
CREATE TABLE public.item_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  room_number TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  reason TEXT,
  status item_status DEFAULT 'pending'::item_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.item_requests ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Policy 1: Students can view their own requests
CREATE POLICY "Students can view own item requests" 
ON public.item_requests FOR SELECT 
USING (auth.uid() = student_id);

-- Policy 2: Item Workers and Admins can view all requests
CREATE POLICY "Workers and Admins can view all item requests" 
ON public.item_requests FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('worker_laundry', 'admin')
  )
);

-- Policy 3: Students can insert their own requests
CREATE POLICY "Students can insert own item requests" 
ON public.item_requests FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- Policy 4: Students can update their own request ONLY to confirm completion
CREATE POLICY "Students can confirm completed item requests" 
ON public.item_requests FOR UPDATE 
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- Policy 5: Workers and Admins can update item request statuses
CREATE POLICY "Workers and Admins can update item requests" 
ON public.item_requests FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('worker_laundry', 'admin')
  )
);
