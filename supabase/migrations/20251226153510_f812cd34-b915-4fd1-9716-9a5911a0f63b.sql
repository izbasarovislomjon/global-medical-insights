-- Create storage bucket for manuscripts
INSERT INTO storage.buckets (id, name, public) VALUES ('manuscripts', 'manuscripts', false);

-- Create policies for manuscript uploads
CREATE POLICY "Users can upload their own manuscripts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'manuscripts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own manuscripts"
ON storage.objects FOR SELECT
USING (bucket_id = 'manuscripts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all manuscripts"
ON storage.objects FOR SELECT
USING (bucket_id = 'manuscripts' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete manuscripts"
ON storage.objects FOR DELETE
USING (bucket_id = 'manuscripts' AND public.has_role(auth.uid(), 'admin'));