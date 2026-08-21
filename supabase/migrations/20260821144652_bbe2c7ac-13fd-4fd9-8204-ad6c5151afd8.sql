DROP VIEW IF EXISTS public.community_profiles;

CREATE OR REPLACE FUNCTION public.get_community_profiles(_user_ids uuid[])
RETURNS TABLE(user_id uuid, full_name text, avatar_url text, "position" text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.full_name, p.avatar_url, p."position"
  FROM public.profiles p
  WHERE p.user_id = ANY(_user_ids)
$$;

GRANT EXECUTE ON FUNCTION public.get_community_profiles(uuid[]) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.ensure_single_active_preset()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active THEN
    UPDATE public.demo_presets SET is_active = false WHERE id <> NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$;