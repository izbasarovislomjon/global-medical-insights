-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can manage submissions" ON public.submissions;

-- Create proper admin policies for submissions
CREATE POLICY "Admins can select all submissions" 
ON public.submissions 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all submissions" 
ON public.submissions 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all submissions" 
ON public.submissions 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));