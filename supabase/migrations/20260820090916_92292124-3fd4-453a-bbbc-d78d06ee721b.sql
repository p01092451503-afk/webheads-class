DROP POLICY IF EXISTS "Teachers/admins can manage assessments" ON public.assessments;
CREATE POLICY "Teachers/admins can manage assessments" ON public.assessments FOR ALL TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'teacher'::app_role))
WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'teacher'::app_role));

DROP POLICY IF EXISTS "Anyone can view published assessments" ON public.assessments;
CREATE POLICY "Anyone can view published assessments" ON public.assessments FOR SELECT TO authenticated
USING (is_published = true OR has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'teacher'::app_role));

DROP POLICY IF EXISTS "Teachers/admins can manage questions" ON public.assessment_questions;
CREATE POLICY "Teachers/admins can manage questions" ON public.assessment_questions FOR ALL TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'teacher'::app_role))
WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'teacher'::app_role));

DROP POLICY IF EXISTS "Only teachers/admins can view questions directly" ON public.assessment_questions;
CREATE POLICY "Only teachers/admins can view questions directly" ON public.assessment_questions FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'teacher'::app_role));