/*
  # Update Tickets Table Schema

  1. Changes
    - Add `user_id` column (uuid) linking to users table
    - Add `request_text` column (text) for the ticket description
    - Add `category` column (text) for ticket categorization
    - Add `complexity_score` column (numeric) for AI complexity assessment
    - Add `auto_resolved` column (boolean) to track automated resolutions
    - Add `completed_at` column (timestamptz) for completion timestamp
    - Rename/map existing columns to match application expectations

  2. Data Migration
    - Preserve existing data where possible
    - Set default values for new columns

  3. Security
    - Update RLS policies for new user_id column
    - Ensure users can only see their own tickets
    - Admins can see all tickets
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  -- Add user_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tickets' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE tickets ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  -- Add request_text column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tickets' AND column_name = 'request_text'
  ) THEN
    ALTER TABLE tickets ADD COLUMN request_text text;
  END IF;

  -- Add category column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tickets' AND column_name = 'category'
  ) THEN
    ALTER TABLE tickets ADD COLUMN category text DEFAULT 'other' CHECK (category IN ('password_reset', 'access_request', 'hardware', 'software', 'network', 'other'));
  END IF;

  -- Add complexity_score column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tickets' AND column_name = 'complexity_score'
  ) THEN
    ALTER TABLE tickets ADD COLUMN complexity_score numeric DEFAULT 5;
  END IF;

  -- Add auto_resolved column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tickets' AND column_name = 'auto_resolved'
  ) THEN
    ALTER TABLE tickets ADD COLUMN auto_resolved boolean DEFAULT false;
  END IF;

  -- Add completed_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tickets' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE tickets ADD COLUMN completed_at timestamptz;
  END IF;

  -- Add resolution_notes column if doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tickets' AND column_name = 'resolution_notes'
  ) THEN
    ALTER TABLE tickets ADD COLUMN resolution_notes text;
  END IF;
END $$;

-- Update status column to support new values
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check 
  CHECK (status IN ('pending', 'processing', 'automated', 'escalated', 'completed', 'failed'));

-- Update priority column to ensure proper values
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_priority_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_priority_check 
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

-- Drop old RLS policies if they exist
DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON tickets;
DROP POLICY IF EXISTS "Admins can update all tickets" ON tickets;

-- Create new RLS policies
CREATE POLICY "Users can view own tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own tickets"
  ON tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tickets"
  ON tickets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all tickets"
  ON tickets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );
