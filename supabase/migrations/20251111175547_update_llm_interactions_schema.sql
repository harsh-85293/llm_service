/*
  # Update LLM Interactions Schema

  1. Changes
    - Add `latency_ms` column (integer) to track response time
    - Ensure all columns match the TypeScript interface

  2. Notes
    - Table already has most required columns
    - Just adding missing latency tracking
*/

-- Add latency_ms column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'llm_interactions' AND column_name = 'latency_ms'
  ) THEN
    ALTER TABLE llm_interactions ADD COLUMN latency_ms integer DEFAULT 0;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_llm_interactions_ticket_id ON llm_interactions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_llm_interactions_created_at ON llm_interactions(created_at DESC);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own ticket interactions" ON llm_interactions;
DROP POLICY IF EXISTS "Admins can view all interactions" ON llm_interactions;
DROP POLICY IF EXISTS "System can insert interactions" ON llm_interactions;

CREATE POLICY "Users can view own ticket interactions"
  ON llm_interactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = llm_interactions.ticket_id
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all interactions"
  ON llm_interactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert interactions"
  ON llm_interactions FOR INSERT
  TO authenticated
  WITH CHECK (true);
