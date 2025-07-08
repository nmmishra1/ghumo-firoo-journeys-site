
-- Add user approval system
ALTER TABLE public.profiles 
ADD COLUMN approved BOOLEAN NOT NULL DEFAULT false;

-- Add lead assignment and new fields to leads table
ALTER TABLE public.leads 
ADD COLUMN enquiry_number TEXT UNIQUE,
ADD COLUMN assigned_to UUID REFERENCES public.profiles(id),
ADD COLUMN customer_type TEXT CHECK (customer_type IN ('Direct Customer', 'Phone', 'Facebook', 'Insta')),
ADD COLUMN tour_description TEXT,
ADD COLUMN call_follow_up TEXT CHECK (call_follow_up IN ('Call picked', 'Switched off', 'Not reachable')),
ADD COLUMN lead_prospect TEXT CHECK (lead_prospect IN ('Hot', 'Cold')),
ADD COLUMN call_summary TEXT,
ADD COLUMN next_call_time TIMESTAMP WITH TIME ZONE;

-- Rename existing fields to match new requirements
ALTER TABLE public.leads RENAME COLUMN name TO customer_name;
ALTER TABLE public.leads RENAME COLUMN phone TO contact_number;

-- Create function to generate enquiry numbers
CREATE OR REPLACE FUNCTION generate_enquiry_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    enquiry_num TEXT;
BEGIN
    -- Get the next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(enquiry_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_num
    FROM public.leads 
    WHERE enquiry_number IS NOT NULL;
    
    -- Generate enquiry number in format ENQ001, ENQ002, etc.
    enquiry_num := 'ENQ' || LPAD(next_num::TEXT, 3, '0');
    
    RETURN enquiry_num;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate enquiry numbers
CREATE OR REPLACE FUNCTION set_enquiry_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.enquiry_number IS NULL THEN
        NEW.enquiry_number := generate_enquiry_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_enquiry_number
    BEFORE INSERT ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION set_enquiry_number();

-- Update RLS policies for user approval and lead assignment

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all leads" ON public.leads;

-- New profile policies - only approved users can access
CREATE POLICY "Approved users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
    -- User can see their own profile OR user is admin OR user is approved
    id = auth.uid() OR 
    public.get_current_user_role() = 'admin' OR
    (SELECT approved FROM public.profiles WHERE id = auth.uid()) = true
);

-- New lead policies - only admin or assigned user can view leads
CREATE POLICY "Restricted lead access" 
ON public.leads 
FOR SELECT 
TO authenticated
USING (
    -- Admin can see all leads
    public.get_current_user_role() = 'admin' OR
    -- User can see leads assigned to them (if approved)
    (assigned_to = auth.uid() AND (SELECT approved FROM public.profiles WHERE id = auth.uid()) = true) OR
    -- User can see leads they created (if approved)
    (created_by = auth.uid() AND (SELECT approved FROM public.profiles WHERE id = auth.uid()) = true)
);

-- Update lead insert policy
DROP POLICY IF EXISTS "Authenticated users can create leads" ON public.leads;
CREATE POLICY "Approved users can create leads" 
ON public.leads 
FOR INSERT 
TO authenticated
WITH CHECK (
    auth.uid() = created_by AND 
    (public.get_current_user_role() = 'admin' OR (SELECT approved FROM public.profiles WHERE id = auth.uid()) = true)
);

-- Update lead update policy  
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;
CREATE POLICY "Restricted lead updates" 
ON public.leads 
FOR UPDATE 
TO authenticated
USING (
    -- Admin can update all leads
    public.get_current_user_role() = 'admin' OR
    -- User can update leads assigned to them (if approved)
    (assigned_to = auth.uid() AND (SELECT approved FROM public.profiles WHERE id = auth.uid()) = true) OR
    -- User can update leads they created (if approved)  
    (created_by = auth.uid() AND (SELECT approved FROM public.profiles WHERE id = auth.uid()) = true)
);

-- Update comment policies for approved users only
DROP POLICY IF EXISTS "Authenticated users can view all comments" ON public.lead_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.lead_comments;

CREATE POLICY "Approved users can view comments" 
ON public.lead_comments 
FOR SELECT 
TO authenticated
USING (
    -- Admin can see all comments
    public.get_current_user_role() = 'admin' OR
    -- User can see comments on leads they can access (if approved)
    ((SELECT approved FROM public.profiles WHERE id = auth.uid()) = true AND
     EXISTS (
         SELECT 1 FROM public.leads 
         WHERE id = lead_id AND 
         (assigned_to = auth.uid() OR created_by = auth.uid() OR public.get_current_user_role() = 'admin')
     ))
);

CREATE POLICY "Approved users can create comments" 
ON public.lead_comments 
FOR INSERT 
TO authenticated
WITH CHECK (
    auth.uid() = created_by AND 
    (public.get_current_user_role() = 'admin' OR (SELECT approved FROM public.profiles WHERE id = auth.uid()) = true) AND
    EXISTS (
        SELECT 1 FROM public.leads 
        WHERE id = lead_id AND 
        (assigned_to = auth.uid() OR created_by = auth.uid() OR public.get_current_user_role() = 'admin')
    )
);

-- Create predefined users (navin, sangita) 
INSERT INTO public.profiles (id, full_name, role, approved)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Navin', 'user', true),
    ('22222222-2222-2222-2222-222222222222', 'Sangita', 'user', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_enquiry_number ON public.leads(enquiry_number);
CREATE INDEX IF NOT EXISTS idx_profiles_approved ON public.profiles(approved);
