-- ====================================================================================
-- Hostel Management System - Phase 8 Schema (Accountant & Electricity Bills)
-- ====================================================================================

-- 1. Create enum for bill status
CREATE TYPE bill_status AS ENUM ('pending', 'paid', 'overdue');

-- 2. Create the ELECTRICITY_BILLS table
CREATE TABLE public.electricity_bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  room_number TEXT NOT NULL,
  billing_month TEXT NOT NULL, -- e.g., "October 2026"
  units INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status bill_status DEFAULT 'pending'::bill_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.electricity_bills ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Students can view their own bills
CREATE POLICY "Students can view own electricity bills" 
ON public.electricity_bills FOR SELECT 
USING (auth.uid() = student_id);

-- Accountants and Admins can view all bills
CREATE POLICY "Accountants and Admins can view all bills" 
ON public.electricity_bills FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('accountant', 'admin')
  )
);

-- Accountants and Admins can insert/update bills
CREATE POLICY "Accountants and Admins can manage bills" 
ON public.electricity_bills FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('accountant', 'admin')
  )
);
