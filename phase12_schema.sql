-- ====================================================================================
-- Hostel Management System - Phase 12 Schema (Audit Logs & Analytics)
-- ====================================================================================

-- 1. Create the AUDIT_LOGS table
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Only Admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs FOR SELECT 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Anyone can insert an audit log (e.g. via backend or triggers)
CREATE POLICY "Anyone can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);
