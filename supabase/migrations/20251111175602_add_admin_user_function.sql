/*
  # Add Helper Function for Admin Users

  1. New Functions
    - `make_user_admin` - Function to promote a user to admin role
    - Can only be called by super_admins or during initial setup

  2. Notes
    - This helps with testing and initial setup
    - First user can be made admin manually via SQL
*/

-- Function to make a user an admin
CREATE OR REPLACE FUNCTION make_user_admin(user_email text, new_role text DEFAULT 'admin')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate role
  IF new_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Invalid role. Must be admin or super_admin';
  END IF;

  -- Update user role
  UPDATE users
  SET role = new_role
  WHERE email = user_email;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION make_user_admin TO authenticated;
