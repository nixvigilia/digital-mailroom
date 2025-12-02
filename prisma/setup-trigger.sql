-- Drop existing functions/triggers if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TRIGGER IF EXISTS on_profile_user_deleted ON public.profile;
DROP FUNCTION IF EXISTS public.handle_user_delete();

-- 1. Function to create profile with metadata from auth.users
-- Note: Referral code generation is done on the dashboard, not during signup
-- 
-- Flow for referral tracking:
-- 1. User visits signup?ref=09E029FE
-- 2. Signup action looks up referrer by code "09E029FE" → gets referrer's UUID
-- 3. Stores referrer's UUID in Supabase metadata as 'referred_by'
-- 4. This trigger reads 'referred_by' from metadata and saves it to profile.referred_by
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referred_by UUID;
  v_referred_by_text TEXT;
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
  
  -- Insert profile with referred_by field set (if user was referred)
  -- The referral code will be generated later when user visits dashboard
  INSERT INTO public.profile (id, avatar_url, email, referred_by, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.email,
    v_referred_by, -- This is the referrer's user ID (UUID), not the code
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

-- DROP FUNCTION handle_new_user() CASCADE;
-- DROP FUNCTION handle_user_delete() CASCADE;