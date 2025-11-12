/*
  # Update Audit Logs Schema

  1. Changes
    - Add `user_id` column (uuid) linking to users table
    - Add `action_type` column with proper enum values
    - Add `action_details` column (jsonb) for structured data
    - Add `success` column (boolean) to track operation success
    - Add `error_message` column (text) for error tracking

  2. Security
    - Update RLS policies for audit logs
    - Users can view logs for their own tickets
    - Admins can view all logs
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  -- Add user_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  -- Add action_type column with proper constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'action_type'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN action_type text;
  END IF;

  -- Add action_details column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'action_details'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN action_details jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add success column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'success'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN success boolean DEFAULT true;
  END IF;

  -- Add error_message column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'error_message'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN error_message text;
  END IF;
END $$;

-- Add constraint for action_type
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_type_check;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_type_check 
  CHECK (action_type IN ('request_created', 'ai_analysis', 'automation_executed', 'escalated', 'admin_action', 'completed'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ticket_id ON audit_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view own ticket logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can view all logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Create RLS policies
CREATE POLICY "Users can view own ticket logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = audit_logs.ticket_id
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
