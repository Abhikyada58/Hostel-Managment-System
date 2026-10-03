-- ====================================================================================
-- Hostel Management System - Phase 9 Schema (Hostel Fees & Payments)
-- ====================================================================================

-- 1. Create Enums
CREATE TYPE fee_status AS ENUM ('pending', 'partially_paid', 'paid', 'overdue');
CREATE TYPE payment_type AS ENUM ('hostel_fee', 'electricity');
CREATE TYPE payment_method AS ENUM ('upi', 'cash');

-- 2. Create the HOSTEL_FEES table
-- Each student has exactly one active fee record for the academic year
CREATE TABLE public.hostel_fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_fees DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0 NOT NULL,
  due_date DATE NOT NULL,
  status fee_status DEFAULT 'pending'::fee_status NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the PAYMENT_HISTORY table
CREATE TABLE public.payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type payment_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method payment_method NOT NULL,
  reference_id UUID, -- Optional link to electricity_bills.id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.hostel_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies

-- Students can view their own fees and payment history
CREATE POLICY "Students can view own hostel fees" 
ON public.hostel_fees FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can view own payment history" 
ON public.payment_history FOR SELECT USING (auth.uid() = student_id);

-- Accountants and Admins have full access to fees and history
CREATE POLICY "Accountants can manage hostel fees" 
ON public.hostel_fees FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('accountant', 'admin'))
);

CREATE POLICY "Accountants can manage payment history" 
ON public.payment_history FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('accountant', 'admin'))
);
