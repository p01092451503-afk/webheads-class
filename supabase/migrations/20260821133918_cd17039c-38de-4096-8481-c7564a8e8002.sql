CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_email boolean := COALESCE((m->>'marketing_email')::boolean, false);
  v_sms boolean := COALESCE((m->>'marketing_sms')::boolean, false);
  v_kakao boolean := COALESCE((m->>'marketing_kakao')::boolean, false);
BEGIN
  INSERT INTO public.profiles (
    user_id, full_name, department_id, email,
    phone_number, birth_date, gender,
    marketing_email, marketing_sms, marketing_kakao, marketing_agreed_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(m->>'full_name', ''),
      NULLIF(m->>'name', ''),
      split_part(NEW.email, '@', 1)
    ),
    CASE WHEN NULLIF(m->>'department_id', '') IS NOT NULL
         THEN (m->>'department_id')::uuid ELSE NULL END,
    NEW.email,
    NULLIF(m->>'phone_number', ''),
    CASE WHEN NULLIF(m->>'birth_date', '') IS NOT NULL
         THEN (m->>'birth_date')::date ELSE NULL END,
    NULLIF(m->>'gender', ''),
    v_email, v_sms, v_kakao,
    CASE WHEN v_email OR v_sms OR v_kakao THEN now() ELSE NULL END
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  INSERT INTO public.user_gamification (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;