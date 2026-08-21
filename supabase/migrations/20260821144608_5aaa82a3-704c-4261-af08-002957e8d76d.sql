-- 1) dept role recursion fix
CREATE OR REPLACE FUNCTION public.is_dept_admin_of(_user_id uuid, _department_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_department_roles udr
    WHERE udr.user_id = _user_id
      AND udr.dept_role IN ('dept_admin','team_admin')
      AND udr.department_id = _department_id
  )
$$;

REVOKE ALL ON FUNCTION public.is_dept_admin_of(uuid, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_dept_admin_of(uuid, uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Users can view own dept roles" ON public.user_department_roles;
CREATE POLICY "Users can view own dept roles"
ON public.user_department_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR public.is_dept_admin_of(auth.uid(), department_id)
);

DROP POLICY IF EXISTS "Admins can manage dept roles" ON public.user_department_roles;
CREATE POLICY "Admins can manage dept roles"
ON public.user_department_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- 2) profiles PII exposure to anon
DROP POLICY IF EXISTS "community author profiles viewable" ON public.profiles;

CREATE OR REPLACE VIEW public.community_profiles
WITH (security_invoker = off)
AS
  SELECT p.user_id, p.full_name, p.avatar_url, p.position
  FROM public.profiles p;

GRANT SELECT ON public.community_profiles TO anon, authenticated;

-- 3) ia_* identity-condition bugs
DROP POLICY IF EXISTS ia_deliv_member_view ON public.ia_project_deliverables;
CREATE POLICY ia_deliv_member_view
ON public.ia_project_deliverables
FOR SELECT
TO authenticated
USING (
  submitted_by = auth.uid()
  OR EXISTS (SELECT 1 FROM public.ia_projects p WHERE p.id = ia_project_deliverables.project_id AND p.lead_teacher_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.ia_project_members m WHERE m.project_id = ia_project_deliverables.project_id AND m.user_id = auth.uid())
);

DROP POLICY IF EXISTS ia_deliv_member_insert ON public.ia_project_deliverables;
CREATE POLICY ia_deliv_member_insert
ON public.ia_project_deliverables
FOR INSERT
TO authenticated
WITH CHECK (
  submitted_by = auth.uid()
  AND EXISTS (SELECT 1 FROM public.ia_project_members m WHERE m.project_id = ia_project_deliverables.project_id AND m.user_id = auth.uid())
);

DROP POLICY IF EXISTS ia_milestones_member_view ON public.ia_project_milestones;
CREATE POLICY ia_milestones_member_view
ON public.ia_project_milestones
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.ia_projects p WHERE p.id = ia_project_milestones.project_id AND p.lead_teacher_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.ia_project_members m WHERE m.project_id = ia_project_milestones.project_id AND m.user_id = auth.uid())
);