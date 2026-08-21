DROP POLICY IF EXISTS "Authenticated read active videos" ON public.content_videos;

CREATE POLICY "Staff read videos"
ON public.content_videos FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'branch_admin')
  OR public.has_role(auth.uid(), 'teacher')
);

REVOKE SELECT ON public.content_videos FROM anon;