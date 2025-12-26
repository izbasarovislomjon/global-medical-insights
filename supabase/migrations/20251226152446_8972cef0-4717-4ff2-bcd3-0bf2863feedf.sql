-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  affiliation TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create journals table
CREATE TABLE public.journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  issn TEXT NOT NULL UNIQUE,
  impact_factor TEXT,
  frequency TEXT,
  image_url TEXT,
  slug TEXT NOT NULL UNIQUE,
  editor_in_chief TEXT,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create issues table for journal issues
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID REFERENCES public.journals(id) ON DELETE CASCADE NOT NULL,
  volume INTEGER NOT NULL,
  issue_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month TEXT,
  is_current BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create articles table for published articles
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT,
  keywords TEXT[],
  authors JSONB NOT NULL DEFAULT '[]',
  pdf_url TEXT,
  doi TEXT,
  pages TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create submissions table for article submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  journal_id UUID REFERENCES public.journals(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT,
  keywords TEXT[],
  authors JSONB NOT NULL DEFAULT '[]',
  manuscript_url TEXT,
  supplementary_files JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'revision_required', 'accepted', 'rejected', 'published')),
  editor_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Create has_role function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies (only admins can manage roles)
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Journals policies (public read, admin write)
CREATE POLICY "Journals are publicly viewable" ON public.journals FOR SELECT USING (true);
CREATE POLICY "Admins can manage journals" ON public.journals FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Issues policies (public read, admin write)
CREATE POLICY "Issues are publicly viewable" ON public.issues FOR SELECT USING (true);
CREATE POLICY "Admins can manage issues" ON public.issues FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Articles policies (public read, admin write)
CREATE POLICY "Articles are publicly viewable" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Admins can manage articles" ON public.articles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Submissions policies
CREATE POLICY "Users can view their own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their pending submissions" ON public.submissions FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins can view all submissions" ON public.submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage submissions" ON public.submissions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journals_updated_at BEFORE UPDATE ON public.journals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample journals
INSERT INTO public.journals (title, subtitle, description, issn, impact_factor, frequency, slug, editor_in_chief, scope) VALUES
('Web of Medicine', 'Journal of Medicine, Practice and Nursing', 'An international open access journal in medicine, medical practice and nursing. The journal publishes research in medical informatics, healthcare systems evaluation, clinical decision making, and medical education.', '2938-3765', '7.555', 'Monthly (12 issues/year)', 'web-of-medicine', 'Dr. John Smith', 'Medicine, Healthcare, Nursing, Clinical Research'),
('Web of Scientists and Scholars', 'Journal of Multidisciplinary Research', 'An open access peer-reviewed international journal in multidisciplinary research. Publishes original research in physics, biology, chemistry, engineering, technology and food sciences.', '2938-3811', '7.995', 'Monthly (12 issues/year)', 'web-of-scientists', 'Prof. Jane Doe', 'Physics, Biology, Chemistry, Engineering, Technology'),
('Web of Education', 'Journal of Educational Sciences', 'An international journal in educational sciences. Publishes research in pedagogy, teaching methodology, modern educational technologies and educational management.', '2938-3828', '6.875', 'Monthly (12 issues/year)', 'web-of-education', 'Dr. Robert Brown', 'Education, Pedagogy, Teaching Methodology'),
('Web of Technology', 'Journal of Engineering and Innovation', 'An international journal in engineering and innovation. Publishes research in information technology, artificial intelligence, robotics and modern technological solutions.', '2938-3835', '8.125', 'Monthly (12 issues/year)', 'web-of-technology', 'Prof. Alice Johnson', 'IT, AI, Robotics, Engineering'),
('Web of Economics', 'Journal of Business and Finance', 'An international journal in economics and finance. Publishes research in macroeconomics, microeconomics, financial markets and business management.', '2938-3842', '7.250', 'Monthly (12 issues/year)', 'web-of-economics', 'Dr. Michael Williams', 'Economics, Finance, Business Management');