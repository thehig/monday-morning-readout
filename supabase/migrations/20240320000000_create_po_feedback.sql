-- Create enum type for velocity indicators
CREATE TYPE velocity_indicator AS ENUM ('Rot', 'Gelb', 'Grün');

-- Create po_feedback table
CREATE TABLE IF NOT EXISTS po_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_by TEXT NOT NULL CHECK (submitted_by ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'), -- Email format validation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 53),
  progress_percent INTEGER NOT NULL CHECK (progress_percent BETWEEN 0 AND 100),
  team_happiness INTEGER NOT NULL CHECK (team_happiness BETWEEN 1 AND 5),
  customer_happiness INTEGER NOT NULL CHECK (customer_happiness BETWEEN 1 AND 5),
  velocity_next_week velocity_indicator NOT NULL,
  milestones_done TEXT,
  risks TEXT,
  
  -- Add indexes for common queries
  CONSTRAINT unique_week_submitter UNIQUE (week_number, submitted_by)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE po_feedback ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access for authenticated users" 
  ON po_feedback FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow insert access to authenticated users (can only insert their own email)
CREATE POLICY "Allow insert access for authenticated users" 
  ON po_feedback FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.jwt() ->> 'email' = submitted_by);

-- Allow update access to authenticated users (can only update their own feedback)
CREATE POLICY "Allow update access for authenticated users" 
  ON po_feedback FOR UPDATE 
  TO authenticated 
  USING (auth.jwt() ->> 'email' = submitted_by)
  WITH CHECK (auth.jwt() ->> 'email' = submitted_by); 