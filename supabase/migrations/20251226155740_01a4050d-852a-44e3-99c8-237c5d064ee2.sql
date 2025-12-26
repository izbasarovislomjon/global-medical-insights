-- Ensure PostgREST can join submissions -> profiles by adding a FK to profiles.user_id
ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_user_id_profiles_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles (user_id)
  ON DELETE CASCADE;

-- Allow admins to read submitter info in admin panel
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));