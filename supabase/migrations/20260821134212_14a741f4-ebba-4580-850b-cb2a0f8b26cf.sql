DROP POLICY IF EXISTS "admins manage banners" ON public.hero_banners;

CREATE POLICY "admins manage banners"
ON public.hero_banners
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_banners TO authenticated;
GRANT SELECT ON public.hero_banners TO anon;
GRANT ALL ON public.hero_banners TO service_role;