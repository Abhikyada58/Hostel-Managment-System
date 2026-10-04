-- Storage policies for laundry-images
CREATE POLICY "Public Laundry Images" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'laundry-images' );

CREATE POLICY "Workers can upload laundry images" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'laundry-images' );

CREATE POLICY "Workers can update laundry images" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'laundry-images' );
