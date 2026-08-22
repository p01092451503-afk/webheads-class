DROP POLICY IF EXISTS "comments public viewable" ON public.community_comments;
DROP POLICY IF EXISTS "comments viewable" ON public.community_comments;

CREATE POLICY "comments viewable on visible posts"
ON public.community_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_posts p
    WHERE p.id = community_comments.post_id
      AND p.is_hidden = false
  )
  OR author_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);