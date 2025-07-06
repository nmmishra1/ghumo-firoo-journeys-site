-- Add missing columns to existing leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS travel_interest TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Update existing records to have created_by as the first user (temporary fix)
UPDATE public.leads 
SET created_by = (SELECT id FROM auth.users LIMIT 1)
WHERE created_by IS NULL;

-- Make created_by NOT NULL after updating existing records
ALTER TABLE public.leads 
ALTER COLUMN created_by SET NOT NULL;

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