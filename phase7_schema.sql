-- ====================================================================================
-- Hostel Management System - Phase 7 Schema (Food & Cook Management)
-- ====================================================================================

-- 1. Create FOOD_MENUS table
CREATE TABLE public.food_menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_date DATE UNIQUE NOT NULL,
  breakfast TEXT NOT NULL,
  lunch TEXT NOT NULL,
  dinner TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Enums for Food Complaints
CREATE TYPE complaint_status AS ENUM ('pending', 'in_progress', 'resolved', 'closed');
CREATE TYPE complaint_type AS ENUM ('query', 'complaint', 'suggestion');

-- 3. Create FOOD_COMPLAINTS table
CREATE TABLE public.food_complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type complaint_type NOT NULL,
  message TEXT NOT NULL,
  cook_response TEXT,
  status complaint_status DEFAULT 'pending'::complaint_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.food_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_complaints ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for Food Menus

-- Everyone can view the food menu
CREATE POLICY "Anyone can view food menus" 
ON public.food_menus FOR SELECT 
USING (auth.role() = 'authenticated');

-- Only Cooks and Admins can insert/update menus
CREATE POLICY "Cooks and Admins can manage menus" 
ON public.food_menus FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('cook', 'admin')
  )
);

-- 6. Create RLS Policies for Food Complaints

-- Students can view their own complaints
CREATE POLICY "Students can view own food complaints" 
ON public.food_complaints FOR SELECT 
USING (auth.uid() = student_id);

-- Cooks and Admins can view all complaints
CREATE POLICY "Cooks and Admins can view all food complaints" 
ON public.food_complaints FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('cook', 'admin')
  )
);

-- Students can insert their own complaints
CREATE POLICY "Students can insert own food complaints" 
ON public.food_complaints FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- Students can update to close complaints, Cooks/Admins can respond and change status
CREATE POLICY "Cooks, Admins and Students can update food complaints" 
ON public.food_complaints FOR UPDATE 
USING (
  auth.uid() = student_id OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('cook', 'admin')
  )
);
