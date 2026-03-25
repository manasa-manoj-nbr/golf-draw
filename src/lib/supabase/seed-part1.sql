-- SEED DATA PART 1: Drop FK and Insert Users
-- Run this FIRST in Supabase SQL Editor

-- Step 1: Find and drop any FK constraint referencing auth.users
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.users'::regclass 
        AND confrelid = 'auth.users'::regclass
    ) LOOP
        EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT ' || quote_ident(r.conname);
        RAISE NOTICE 'Dropped constraint: %', r.conname;
    END LOOP;
END $$;

-- Step 2: Verify constraint is gone
SELECT conname FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass 
AND confrelid = 'auth.users'::regclass;
-- Should return 0 rows

-- Step 3: Insert sample users
INSERT INTO public.users (id, email, full_name, role, charity_id, charity_percentage, created_at) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'john.smith@example.com', 'John Smith', 'user', NULL, 15, NOW() - INTERVAL '3 months'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'sarah.jones@example.com', 'Sarah Jones', 'user', NULL, 20, NOW() - INTERVAL '2 months'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'mike.wilson@example.com', 'Mike Wilson', 'user', NULL, 10, NOW() - INTERVAL '2 months'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'emma.brown@example.com', 'Emma Brown', 'user', NULL, 25, NOW() - INTERVAL '1 month'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'david.taylor@example.com', 'David Taylor', 'user', NULL, 15, NOW() - INTERVAL '1 month'),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'lisa.anderson@example.com', 'Lisa Anderson', 'user', NULL, 30, NOW() - INTERVAL '3 weeks'),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 'james.martin@example.com', 'James Martin', 'user', NULL, 10, NOW() - INTERVAL '2 weeks'),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 'amy.garcia@example.com', 'Amy Garcia', 'user', NULL, 20, NOW() - INTERVAL '1 week'),
  ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'robert.lee@example.com', 'Robert Lee', 'user', NULL, 15, NOW() - INTERVAL '5 days'),
  ('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a', 'jennifer.white@example.com', 'Jennifer White', 'user', NULL, 10, NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- Step 4: Verify users inserted
SELECT id, email, full_name FROM public.users WHERE email LIKE '%@example.com';
