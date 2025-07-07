-- Update lead status options to match the travel funnel
UPDATE public.leads 
SET status = 'New' 
WHERE status NOT IN ('New', 'Contacted', 'Quote Sent', 'Quote Approved', 'Converted', 'Dropped');

-- Create profiles with role support for user management
UPDATE public.profiles 
SET role = 'admin' 
WHERE role IS NULL;

-- Create a function to get current user role (to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Update RLS policies for leads to support role-based access
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- New policies for role-based access
CREATE POLICY "Authenticated users can view all leads" 
ON public.leads 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create leads" 
ON public.leads 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update leads" 
ON public.leads 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Only admins can delete leads" 
ON public.leads 
FOR DELETE 
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Update profiles policies for user management
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only admins can create new users" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update user profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);