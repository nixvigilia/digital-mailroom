-- Drop existing functions/triggers if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TRIGGER IF EXISTS on_profile_user_deleted ON public.profile;
DROP FUNCTION IF EXISTS public.handle_user_delete();

-- 1. Function to create profile with metadata from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profile (id, full_name, avatar_url, email, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.email,
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