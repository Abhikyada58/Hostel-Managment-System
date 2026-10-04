-- 1. Add 'disputed' to the laundry_status ENUM
ALTER TYPE laundry_status ADD VALUE IF NOT EXISTS 'disputed';

-- 2. Add columns to the table for photos and disputes
ALTER TABLE public.laundry_requests 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS dispute_reason TEXT;

-- 3. We need to allow laundry workers to INSERT laundry requests.
-- Currently only students can insert.
CREATE POLICY "Workers can insert laundry requests" 
ON public.laundry_requests FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'worker_laundry'
  )
);
