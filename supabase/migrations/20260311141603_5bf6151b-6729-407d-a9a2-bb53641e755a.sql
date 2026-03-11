
-- Remove overly permissive anon policies
DROP POLICY IF EXISTS "Anyone can insert policies" ON public.policies;
DROP POLICY IF EXISTS "Anyone can view policies by policy number" ON public.policies;
