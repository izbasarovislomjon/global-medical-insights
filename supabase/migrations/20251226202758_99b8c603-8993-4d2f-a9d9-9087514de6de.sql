-- Add INSERT policy for admins to upload files
CREATE POLICY "Admins can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'manuscripts' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Add UPDATE policy for admins
CREATE POLICY "Admins can update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'manuscripts' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Make published folder publicly readable
CREATE POLICY "Published manuscripts are public"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'manuscripts' 
  AND (storage.foldername(name))[1] = 'published'
);