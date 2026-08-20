ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS notify_purchase boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_inquiry boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS two_factor_method text NOT NULL DEFAULT 'email';

ALTER TABLE public.instructor_profiles
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[];