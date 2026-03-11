
-- Create policies table
CREATE TABLE public.policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  policy_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  -- Property info
  address text NOT NULL,
  property_type text,
  year_built integer,
  sqft integer,
  units integer DEFAULT 1,
  construction_type text,
  heating_type text,
  roof_type text,
  replacement_cost integer,
  -- Coverage
  tier text NOT NULL,
  annual_premium integer NOT NULL,
  monthly_premium integer NOT NULL,
  liability_limit text,
  rental_income_limit integer,
  effective_date date NOT NULL,
  expiry_date date NOT NULL,
  -- Insured info
  insured_first_name text NOT NULL,
  insured_last_name text NOT NULL,
  insured_email text NOT NULL,
  insured_phone text,
  mailing_address text,
  -- Additional insured
  additional_insured_name text,
  additional_insured_type text,
  additional_insured_email text,
  -- Payment
  payment_method text DEFAULT 'simulated',
  payment_last_four text,
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own policies" ON public.policies
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own policies" ON public.policies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own policies" ON public.policies
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON public.policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Also allow anonymous policy creation for unauthenticated users
CREATE POLICY "Anyone can insert policies" ON public.policies
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anyone can view policies by policy number" ON public.policies
  FOR SELECT TO anon USING (true);
