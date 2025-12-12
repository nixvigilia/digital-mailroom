-- Drop existing functions/triggers if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TRIGGER IF EXISTS on_profile_user_deleted ON public.profile;
DROP FUNCTION IF EXISTS public.handle_user_delete();

-- Helper function to generate a unique referral code
CREATE OR REPLACE FUNCTION public.generate_unique_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_base_code TEXT;
  v_referral_code TEXT;
  v_attempts INTEGER := 0;
  v_max_attempts INTEGER := 10;
  v_suffix TEXT;
  v_exists BOOLEAN;
BEGIN
  -- Base code from user ID (first 8 chars, uppercase, no dashes)
  v_base_code := UPPER(REPLACE(SUBSTRING(p_user_id::TEXT, 1, 8), '-', ''));
  v_referral_code := v_base_code;
  
  -- Check for uniqueness and append suffix if needed
  WHILE v_attempts < v_max_attempts LOOP
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profile WHERE referral_code = v_referral_code) INTO v_exists;
    
    IF NOT v_exists THEN
      RETURN v_referral_code; -- Unique code found
    END IF;
    
    -- If conflict, append a random suffix
    v_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || p_user_id::TEXT), 1, 2));
    v_referral_code := SUBSTRING(v_base_code, 1, 6) || v_suffix;
    v_attempts := v_attempts + 1;
  END LOOP;
  
  -- Fallback: use timestamp-based suffix to ensure uniqueness
  v_suffix := UPPER(SUBSTRING(MD5(p_user_id::TEXT || NOW()::TEXT), 1, 4));
  v_referral_code := SUBSTRING(v_base_code, 1, 4) || v_suffix;
  RETURN v_referral_code;
END;
$$ LANGUAGE plpgsql;

-- 1. Function to create profile with metadata from auth.users
-- Automatically generates referral code upon signup
-- 
-- Flow for referral tracking:
-- 1. User visits signup?ref=09E029FE
-- 2. Signup action looks up referrer by code "09E029FE" → gets referrer's UUID
-- 3. Stores referrer's UUID in Supabase metadata as 'referred_by'
-- 4. This trigger reads 'referred_by' from metadata and saves it to profile.referred_by
-- 5. Automatically generates a unique referral code for the new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referred_by UUID;
  v_referred_by_text TEXT;
  v_referral_code TEXT;
BEGIN
  -- Get referred_by from Supabase metadata (set during signup)
  -- NEW.raw_user_meta_data contains the data passed in supabase.auth.signUp() options.data
  -- First get as text, then convert to UUID to handle null/empty strings properly
  v_referred_by_text := NEW.raw_user_meta_data ->> 'referred_by';
  
  -- Debug: Log the metadata value (remove in production if too verbose)
  -- RAISE NOTICE 'Metadata referred_by value: %', v_referred_by_text;
  
  -- Convert to UUID if not null/empty
  IF v_referred_by_text IS NOT NULL AND v_referred_by_text != '' THEN
    BEGIN
      v_referred_by := v_referred_by_text::UUID;
      -- RAISE NOTICE 'Successfully converted referred_by to UUID: %', v_referred_by;
    EXCEPTION WHEN OTHERS THEN
      -- If UUID conversion fails, log and set to null
      RAISE NOTICE 'Invalid UUID for referred_by: %', v_referred_by_text;
      v_referred_by := NULL;
    END;
  ELSE
    v_referred_by := NULL;
  END IF;
  
  -- Generate unique referral code automatically
  v_referral_code := public.generate_unique_referral_code(NEW.id);
  
  -- Insert profile with referred_by field set (if user was referred) and referral_code
  INSERT INTO public.profile (id, avatar_url, email, referred_by, referral_code, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.email,
    v_referred_by, -- This is the referrer's user ID (UUID), not the code
    v_referral_code, -- Automatically generated unique referral code
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 2. Trigger on auth.users to create profile
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Function to delete user when profile is deleted
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM auth.users WHERE id = OLD.id::uuid;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 4. Trigger on profile delete to remove auth user
CREATE TRIGGER on_profile_user_deleted
AFTER DELETE ON public.profile
FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();


-- Policy 5: Users can read (download) their own mail item files
-- REQUIRED for users to see their mail scans
CREATE POLICY IF NOT EXISTS "Users can view their own mail items"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'keep' AND
  (storage.foldername(name))[1] = 'mail-items' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 6: Operators can read ALL mail item files
-- REQUIRED for operators to view mail scans
CREATE POLICY IF NOT EXISTS "Operators can view all mail items"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'keep' AND
  (storage.foldername(name))[1] = 'mail-items' AND
  public.is_operator() = true
);




-- DROP FUNCTION handle_new_user() CASCADE;
-- DROP FUNCTION handle_user_delete() CASCADE;