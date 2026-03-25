-- SEED DATA FOR GOLF PLATFORM
-- Run this in Supabase SQL Editor
-- This script handles the FK constraint properly

-- Step 1: Check and drop the foreign key constraint if it exists
DO $$ 
BEGIN
    -- Try to drop the constraint (may have different names)
    BEGIN
        ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
    EXCEPTION WHEN undefined_object THEN
        -- Constraint doesn't exist with this name, try others
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_pkey_fkey;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
END $$;

-- Step 2: Find and drop any FK constraint referencing auth.users
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

-- Step 3: Insert sample users (now that FK is removed)
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

-- Step 4: Re-add the foreign key constraint with NOT VALID (won't check existing rows)
ALTER TABLE public.users 
  ADD CONSTRAINT users_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
  NOT VALID;

-- Step 5: Link users to charities
UPDATE public.users SET charity_id = (SELECT id FROM public.charities WHERE name = 'Golf for Good Foundation' LIMIT 1) 
WHERE email IN ('john.smith@example.com', 'sarah.jones@example.com', 'mike.wilson@example.com');

UPDATE public.users SET charity_id = (SELECT id FROM public.charities WHERE name = 'Youth First Initiative' LIMIT 1) 
WHERE email IN ('emma.brown@example.com', 'david.taylor@example.com');

UPDATE public.users SET charity_id = (SELECT id FROM public.charities WHERE name = 'Veterans on the Green' LIMIT 1) 
WHERE email IN ('lisa.anderson@example.com', 'james.martin@example.com', 'amy.garcia@example.com');

UPDATE public.users SET charity_id = (SELECT id FROM public.charities WHERE name = 'Swing for Hope Cancer Foundation' LIMIT 1) 
WHERE email IN ('robert.lee@example.com', 'jennifer.white@example.com');

-- Step 6: Create subscriptions for sample users
INSERT INTO public.subscriptions (user_id, plan_type, status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, created_at) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'yearly', 'active', 'cus_demo001', 'sub_demo001', NOW() - INTERVAL '3 months', NOW() + INTERVAL '9 months', NOW() - INTERVAL '3 months'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'monthly', 'active', 'cus_demo002', 'sub_demo002', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', NOW() - INTERVAL '2 months'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'yearly', 'active', 'cus_demo003', 'sub_demo003', NOW() - INTERVAL '2 months', NOW() + INTERVAL '10 months', NOW() - INTERVAL '2 months'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'monthly', 'active', 'cus_demo004', 'sub_demo004', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', NOW() - INTERVAL '1 month'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'yearly', 'active', 'cus_demo005', 'sub_demo005', NOW() - INTERVAL '1 month', NOW() + INTERVAL '11 months', NOW() - INTERVAL '1 month'),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'monthly', 'active', 'cus_demo006', 'sub_demo006', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', NOW() - INTERVAL '3 weeks'),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 'monthly', 'active', 'cus_demo007', 'sub_demo007', NOW() - INTERVAL '12 days', NOW() + INTERVAL '18 days', NOW() - INTERVAL '2 weeks'),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 'yearly', 'active', 'cus_demo008', 'sub_demo008', NOW() - INTERVAL '1 week', NOW() + INTERVAL '51 weeks', NOW() - INTERVAL '1 week'),
  ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'monthly', 'inactive', 'cus_demo009', 'sub_demo009', NOW() - INTERVAL '35 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 months'),
  ('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a', 'monthly', 'canceled', 'cus_demo010', 'sub_demo010', NOW() - INTERVAL '25 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 months')
ON CONFLICT (user_id) DO UPDATE SET
  plan_type = EXCLUDED.plan_type,
  status = EXCLUDED.status,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end;

-- Step 7: Create scores for users (5 scores each)
-- User 1: John Smith
INSERT INTO public.scores (user_id, score, played_date, created_at) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 32, CURRENT_DATE - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 28, CURRENT_DATE - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 35, CURRENT_DATE - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 31, CURRENT_DATE - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 29, CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '5 days');

-- User 2: Sarah Jones
INSERT INTO public.scores (user_id, score, played_date, created_at) VALUES
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 38, CURRENT_DATE - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 41, CURRENT_DATE - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 36, CURRENT_DATE - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 39, CURRENT_DATE - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 42, CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- User 3: Mike Wilson
INSERT INTO public.scores (user_id, score, played_date, created_at) VALUES
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 25, CURRENT_DATE - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 27, CURRENT_DATE - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 30, CURRENT_DATE - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 24, CURRENT_DATE - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 28, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- User 4: Emma Brown
INSERT INTO public.scores (user_id, score, played_date, created_at) VALUES
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 33, CURRENT_DATE - INTERVAL '26 days', NOW() - INTERVAL '26 days'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 35, CURRENT_DATE - INTERVAL '19 days', NOW() - INTERVAL '19 days'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 31, CURRENT_DATE - INTERVAL '13 days', NOW() - INTERVAL '13 days'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 37, CURRENT_DATE - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 34, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- User 5: David Taylor
INSERT INTO public.scores (user_id, score, played_date, created_at) VALUES
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 40, CURRENT_DATE - INTERVAL '24 days', NOW() - INTERVAL '24 days'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 38, CURRENT_DATE - INTERVAL '17 days', NOW() - INTERVAL '17 days'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 42, CURRENT_DATE - INTERVAL '11 days', NOW() - INTERVAL '11 days'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 36, CURRENT_DATE - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 39, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- User 6: Lisa Anderson
INSERT INTO public.scores (user_id, score, played_date, created_at) VALUES
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 29, CURRENT_DATE - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 31, CURRENT_DATE - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 27, CURRENT_DATE - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 33, CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 30, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- User 7: James Martin
INSERT INTO public.scores (user_id, score, played_date, created_at) VALUES
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 22, CURRENT_DATE - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 26, CURRENT_DATE - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 24, CURRENT_DATE - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 28, CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 25, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- User 8: Amy Garcia
INSERT INTO public.scores (user_id, score, played_date, created_at) VALUES
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 36, CURRENT_DATE - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 38, CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 34, CURRENT_DATE - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 37, CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 35, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- User 9: Robert Lee (only 3 scores - not eligible for draw)
INSERT INTO public.scores (user_id, score, played_date, created_at) VALUES
  ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 32, CURRENT_DATE - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 29, CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 31, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- Step 8: Create draws
INSERT INTO public.draws (id, draw_date, winning_numbers, draw_type, status, total_pool_amount, five_match_pool, four_match_pool, three_match_pool, rollover_amount, created_at, published_at) VALUES
  ('d1111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 months', ARRAY[32, 28, 35, 31, 29], 'random', 'published', 450.00, 180.00, 157.50, 112.50, 0, NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months'),
  ('d2222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '1 month', ARRAY[38, 41, 36, 39, 42], 'algorithmic', 'published', 525.00, 210.00, 183.75, 131.25, 180.00, NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month'),
  ('d3333333-3333-3333-3333-333333333333', CURRENT_DATE + INTERVAL '5 days', ARRAY[]::integer[], 'random', 'pending', 675.00, 270.00, 236.25, 168.75, 390.00, NOW(), NULL)
ON CONFLICT (id) DO UPDATE SET
  winning_numbers = EXCLUDED.winning_numbers,
  total_pool_amount = EXCLUDED.total_pool_amount,
  five_match_pool = EXCLUDED.five_match_pool,
  four_match_pool = EXCLUDED.four_match_pool,
  three_match_pool = EXCLUDED.three_match_pool,
  rollover_amount = EXCLUDED.rollover_amount,
  status = EXCLUDED.status;

-- Step 9: Create prize pools
INSERT INTO public.prize_pools (month, total_amount, five_match_pool, four_match_pool, three_match_pool, rollover_amount, subscriber_count, created_at) VALUES
  (DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::date, 450.00, 180.00, 157.50, 112.50, 0, 6, NOW() - INTERVAL '2 months'),
  (DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date, 525.00, 210.00, 183.75, 131.25, 180.00, 8, NOW() - INTERVAL '1 month'),
  (DATE_TRUNC('month', CURRENT_DATE)::date, 675.00, 270.00, 236.25, 168.75, 390.00, 11, NOW())
ON CONFLICT (month) DO UPDATE SET
  total_amount = EXCLUDED.total_amount,
  five_match_pool = EXCLUDED.five_match_pool,
  four_match_pool = EXCLUDED.four_match_pool,
  three_match_pool = EXCLUDED.three_match_pool,
  rollover_amount = EXCLUDED.rollover_amount,
  subscriber_count = EXCLUDED.subscriber_count;

-- Step 10: Create winners
INSERT INTO public.winners (draw_id, user_id, match_type, matched_numbers, prize_amount, verification_status, payout_status, created_at, verified_at, paid_at) VALUES
  -- Draw 1: John Smith got 5-match jackpot!
  ('d1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'five_match', ARRAY[32, 28, 35, 31, 29], 180.00, 'approved', 'paid', NOW() - INTERVAL '2 months', NOW() - INTERVAL '55 days', NOW() - INTERVAL '50 days'),
  -- Draw 1: Mike Wilson got 3-match
  ('d1111111-1111-1111-1111-111111111111', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'three_match', ARRAY[28, 31, 29], 56.25, 'approved', 'paid', NOW() - INTERVAL '2 months', NOW() - INTERVAL '55 days', NOW() - INTERVAL '50 days'),
  -- Draw 2: Sarah Jones got 4-match (no 5-match winner, so jackpot rolled over)
  ('d2222222-2222-2222-2222-222222222222', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'four_match', ARRAY[38, 41, 36, 39], 183.75, 'approved', 'paid', NOW() - INTERVAL '1 month', NOW() - INTERVAL '25 days', NOW() - INTERVAL '20 days'),
  -- Draw 2: Emma Brown got 3-match
  ('d2222222-2222-2222-2222-222222222222', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'three_match', ARRAY[36, 39, 42], 65.63, 'approved', 'paid', NOW() - INTERVAL '1 month', NOW() - INTERVAL '25 days', NOW() - INTERVAL '20 days'),
  -- Draw 2: David Taylor got 3-match (pending payout)
  ('d2222222-2222-2222-2222-222222222222', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'three_match', ARRAY[38, 42, 36], 65.62, 'approved', 'pending', NOW() - INTERVAL '1 month', NOW() - INTERVAL '25 days', NULL)
ON CONFLICT DO NOTHING;

-- Step 11: Create donations
INSERT INTO public.donations (user_id, charity_id, amount, donation_type, created_at) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', (SELECT id FROM public.charities WHERE name = 'Golf for Good Foundation' LIMIT 1), 19.35, 'subscription', NOW() - INTERVAL '3 months'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', (SELECT id FROM public.charities WHERE name = 'Golf for Good Foundation' LIMIT 1), 3.00, 'subscription', NOW() - INTERVAL '2 months'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', (SELECT id FROM public.charities WHERE name = 'Golf for Good Foundation' LIMIT 1), 12.90, 'subscription', NOW() - INTERVAL '2 months'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', (SELECT id FROM public.charities WHERE name = 'Youth First Initiative' LIMIT 1), 3.75, 'subscription', NOW() - INTERVAL '1 month'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', (SELECT id FROM public.charities WHERE name = 'Youth First Initiative' LIMIT 1), 19.35, 'subscription', NOW() - INTERVAL '1 month'),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', (SELECT id FROM public.charities WHERE name = 'Veterans on the Green' LIMIT 1), 4.50, 'subscription', NOW() - INTERVAL '3 weeks'),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', (SELECT id FROM public.charities WHERE name = 'Veterans on the Green' LIMIT 1), 1.50, 'subscription', NOW() - INTERVAL '2 weeks'),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', (SELECT id FROM public.charities WHERE name = 'Veterans on the Green' LIMIT 1), 25.80, 'subscription', NOW() - INTERVAL '1 week'),
  -- Independent donations
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', (SELECT id FROM public.charities WHERE name = 'Golf for Good Foundation' LIMIT 1), 50.00, 'independent', NOW() - INTERVAL '45 days'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', (SELECT id FROM public.charities WHERE name = 'Golf for Good Foundation' LIMIT 1), 25.00, 'independent', NOW() - INTERVAL '30 days'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', (SELECT id FROM public.charities WHERE name = 'Youth First Initiative' LIMIT 1), 100.00, 'independent', NOW() - INTERVAL '20 days')
ON CONFLICT DO NOTHING;

-- Step 12: Update charity totals
UPDATE public.charities c SET total_donations = (
  SELECT COALESCE(SUM(amount), 0) FROM public.donations WHERE charity_id = c.id
);

-- Step 13: Verify the data
SELECT 'Users' as table_name, COUNT(*) as count FROM public.users
UNION ALL SELECT 'Subscriptions', COUNT(*) FROM public.subscriptions
UNION ALL SELECT 'Active Subscriptions', COUNT(*) FROM public.subscriptions WHERE status = 'active'
UNION ALL SELECT 'Scores', COUNT(*) FROM public.scores
UNION ALL SELECT 'Draws', COUNT(*) FROM public.draws
UNION ALL SELECT 'Winners', COUNT(*) FROM public.winners
UNION ALL SELECT 'Donations', COUNT(*) FROM public.donations
UNION ALL SELECT 'Prize Pools', COUNT(*) FROM public.prize_pools
ORDER BY table_name;
