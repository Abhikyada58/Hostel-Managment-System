-- ====================================================================================
-- Hostel Management System - Phase 13 Schema (Storage Buckets & Profile Updates)
-- ====================================================================================

-- 1. Add 'avatar_url' and 'phone' to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Create Storage Buckets for the application
-- Note: 'public' is set to true so images can be easily displayed without signed URLs
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('profile-images', 'profile-images', true),
  ('problem-images', 'problem-images', true),
  ('laundry-images', 'laundry-images', true),
  ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Security Policies (RLS for Storage)

-- Allow public read access to profile images
CREATE POLICY "Public Profile Images" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'profile-images' );

-- Allow authenticated users to upload their own profile image
CREATE POLICY "Users can upload their own profile image" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'profile-images' AND auth.uid() = owner );

-- Allow authenticated users to update their own profile image
CREATE POLICY "Users can update their own profile image" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'profile-images' AND auth.uid() = owner );
