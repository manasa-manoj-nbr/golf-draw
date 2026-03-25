-- FIX FOR INFINITE RECURSION IN RLS POLICIES
-- Run this ENTIRE script in your Supabase SQL Editor (Dashboard > SQL Editor)
-- This fixes the circular dependency where admin policies query the users table which has RLS

-- Step 1: Create a security definer function to check admin status
-- This function runs with elevated privileges and bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 2: Drop ALL the problematic policies that cause recursion

-- Users table policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- Subscriptions table policies  
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;

-- Scores table policies
DROP POLICY IF EXISTS "Admins can manage all scores" ON public.scores;

-- Draws table policies
DROP POLICY IF EXISTS "Admins can manage draws" ON public.draws;

-- Winners table policies
DROP POLICY IF EXISTS "Admins can manage all winners" ON public.winners;

-- Donations table policies
DROP POLICY IF EXISTS "Admins can view all donations" ON public.donations;

-- Prize pools table policies
DROP POLICY IF EXISTS "Admins can manage prize pools" ON public.prize_pools;

-- Charities table policies
DROP POLICY IF EXISTS "Admins can manage charities" ON public.charities;

-- Step 3: Recreate ALL the policies using the security definer function

-- Users policies (using the function to avoid recursion)
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (public.is_admin());

-- Subscriptions policies
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
    FOR ALL USING (public.is_admin());

-- Scores policies
CREATE POLICY "Admins can manage all scores" ON public.scores
    FOR ALL USING (public.is_admin());

-- Draws policies
CREATE POLICY "Admins can manage draws" ON public.draws
    FOR ALL USING (public.is_admin());

-- Winners policies
CREATE POLICY "Admins can manage all winners" ON public.winners
    FOR ALL USING (public.is_admin());

-- Donations policies
CREATE POLICY "Admins can view all donations" ON public.donations
    FOR SELECT USING (public.is_admin());

-- Prize pools policies
CREATE POLICY "Admins can manage prize pools" ON public.prize_pools
    FOR ALL USING (public.is_admin());

-- Charities policies
CREATE POLICY "Admins can manage charities" ON public.charities
    FOR ALL USING (public.is_admin());

-- Step 4: Verify the fix by checking existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
