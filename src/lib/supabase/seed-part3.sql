-- SEED DATA PART 3 (Optional): Re-add FK constraint
-- Run this AFTER part 2 succeeds (optional - only if you want FK enforcement for future inserts)

ALTER TABLE public.users 
  ADD CONSTRAINT users_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
  NOT VALID;

-- Verify constraint added
SELECT conname FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass 
AND confrelid = 'auth.users'::regclass;
