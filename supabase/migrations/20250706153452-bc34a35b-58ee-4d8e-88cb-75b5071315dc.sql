-- Ensure leads table exists with proper structure
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  travel_interest TEXT,
  discussion_notes TEXT,
  follow_up_date DATE,
  status TEXT NOT NULL DEFAULT 'New',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users only
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

CREATE POLICY "Authenticated users can delete leads" 
ON public.leads 
FOR DELETE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create comments table for internal lead comments
CREATE TABLE IF NOT EXISTS public.lead_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on comments
ALTER TABLE public.lead_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Authenticated users can view all comments" 
ON public.lead_comments 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.lead_comments 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update their own comments" 
ON public.lead_comments 
FOR UPDATE 
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can delete their own comments" 
ON public.lead_comments 
FOR DELETE 
TO authenticated
USING (auth.uid() = created_by);