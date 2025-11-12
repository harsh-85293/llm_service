/*
  # Fix RLS Performance and Security Issues

  1. Performance Improvements
    - Replace `auth.uid()` with `(select auth.uid())` in all RLS policies
    - This prevents re-evaluation of auth functions for each row
    - Significantly improves query performance at scale

  2. Remove Duplicate Policies
    - Drop redundant policies that cause conflicts
    - Keep only one policy per action type per role
    - Consolidate similar policies into single optimized policies

  3. Security Fixes
    - Fix function search_path for `make_user_admin`
    - Ensure all policies use proper subqueries

  4. Clean Up Unused Indexes
    - Remove indexes that aren't being used by queries
    - Keep only essential indexes for performance
*/

-- Drop all existing policies to recreate them with optimized versions
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can create own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON tickets;
DROP POLICY IF EXISTS "Admins can update all tickets" ON tickets;

DROP POLICY IF EXISTS "Users can view own ticket logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view audit logs for their tickets" ON audit_logs;
DROP POLICY IF EXISTS "Admins can view all logs" ON audit_logs;

DROP POLICY IF EXISTS "Users can view own ticket interactions" ON llm_interactions;
DROP POLICY IF EXISTS "Users can view LLM interactions for their tickets" ON llm_interactions;
DROP POLICY IF EXISTS "System can insert interactions" ON llm_interactions;
DROP POLICY IF EXISTS "System can insert LLM interactions" ON llm_interactions;
DROP POLICY IF EXISTS "Admins can view all interactions" ON llm_interactions;

-- USERS TABLE: Optimized RLS Policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can create own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- TICKETS TABLE: Optimized RLS Policies (consolidated duplicates)
CREATE POLICY "Users can view own tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create tickets"
  ON tickets FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own tickets"
  ON tickets FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all tickets"
  ON tickets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- AUDIT_LOGS TABLE: Optimized RLS Policies (consolidated duplicates)
CREATE POLICY "Users can view own ticket logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = audit_logs.ticket_id
      AND tickets.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can view all logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- LLM_INTERACTIONS TABLE: Optimized RLS Policies (consolidated duplicates)
CREATE POLICY "Users can view own ticket interactions"
  ON llm_interactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = llm_interactions.ticket_id
      AND tickets.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can view all interactions"
  ON llm_interactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert interactions"
  ON llm_interactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix function search_path security issue
DROP FUNCTION IF EXISTS make_user_admin(text);

CREATE OR REPLACE FUNCTION make_user_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET role = 'admin'
  WHERE email = user_email;
END;
$$;

-- Drop unused indexes
DROP INDEX IF EXISTS idx_tickets_user_email;
DROP INDEX IF EXISTS idx_tickets_status;
DROP INDEX IF EXISTS idx_tickets_created_at;
DROP INDEX IF EXISTS idx_audit_logs_created_at;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_tickets_category;
DROP INDEX IF EXISTS idx_llm_interactions_created_at;

-- Keep only the essential indexes that are actually used
-- idx_tickets_user_id - used for user ticket lookups
-- idx_audit_logs_ticket_id - used for ticket log lookups
-- idx_llm_interactions_ticket_id - used for ticket interaction lookups
-- idx_audit_logs_user_id - used for user audit lookups
-- idx_users_email - used for email lookups
