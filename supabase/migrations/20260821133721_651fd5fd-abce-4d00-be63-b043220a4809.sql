CREATE POLICY "branch_admin read unassigned profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  department_id IS NULL
  AND public.user_has_any_branch_capability(auth.uid(), 'staff_manage')
);

CREATE POLICY "branch_admin assign unassigned profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (
  department_id IS NULL
  AND public.user_has_any_branch_capability(auth.uid(), 'staff_manage')
)
WITH CHECK (
  public.user_has_any_branch_capability(auth.uid(), 'staff_manage')
);