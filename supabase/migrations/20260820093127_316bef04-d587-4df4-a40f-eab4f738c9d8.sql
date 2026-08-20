
INSERT INTO public.assignment_submissions (assignment_id, student_id, submission_text, status, submitted_at)
SELECT a.id, '9161a7db-b373-44fe-b85e-239647cdcb4a', '노동법의 체계를 헌법-법률-시행령 순으로 정리하여 제출합니다.', 'submitted', now() - interval '2 day' FROM public.assignments a WHERE a.title='1주차 과제 - 노동법 체계 정리';
INSERT INTO public.assignment_submissions (assignment_id, student_id, submission_text, status, submitted_at, score, feedback, graded_by, graded_at)
SELECT a.id, '50909407-7742-454d-b598-da687dbc25a8', '부당해고 사례에서 절차적 정당성이 결여되었다고 판단됩니다.', 'graded', now() - interval '5 day', 92, '쟁점 정리가 명확합니다. 판례 인용을 조금 더 보완하세요.', '8c587b32-f0cf-4a61-a45b-2918032a8f3b', now() - interval '3 day' FROM public.assignments a WHERE a.title='사례형 문제 풀이 제출';
INSERT INTO public.assignment_submissions (assignment_id, student_id, submission_text, status, submitted_at)
SELECT a.id, '64170b22-a185-409e-8ccc-5b0d0b898986', '기출 1번 문항에 대한 논술 답안입니다.', 'submitted', now() - interval '1 day' FROM public.assignments a WHERE a.title='2차 논술 모의 답안';

INSERT INTO public.lecture_groups (name, description, manager_id, order_index, is_active) VALUES
('노동법 기본 강의', '노동법 총론 및 근로기준법 차시 모음', '70b5fbdf-510b-445d-838c-e9aac69f6a64', 1, true),
('인사노무 실무 강의', '실무 중심 차시 모음', '8c587b32-f0cf-4a61-a45b-2918032a8f3b', 2, true),
('2차 논술 강의', '논술 작성법 차시 모음', '24c0a245-f87e-41cf-a350-ad432b093c76', 3, true);

INSERT INTO public.lectures (group_id, title, description, content_type, content_url, play_time_seconds, is_active, status, created_by)
SELECT g.id, '노동법 총론 1차시 · 노동법의 체계', '노동법의 기본 구조를 설명합니다.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 1800, true, 'published', 'f61dbfb0-c75c-464d-93e1-2e768c08d273' FROM public.lecture_groups g WHERE g.name='노동법 기본 강의';
INSERT INTO public.lectures (group_id, title, description, content_type, content_url, play_time_seconds, is_active, status, created_by)
SELECT g.id, '노동법 총론 2차시 · 근로자 개념', '근로자성 판단 기준을 다룹니다.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 2100, true, 'published', 'f61dbfb0-c75c-464d-93e1-2e768c08d273' FROM public.lecture_groups g WHERE g.name='노동법 기본 강의';
INSERT INTO public.lectures (group_id, title, description, content_type, content_url, play_time_seconds, is_active, status, created_by)
SELECT g.id, '논술 1차시 · 답안 구조 설계', '서론-본론-결론 작성 원칙.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 2400, true, 'published', 'f61dbfb0-c75c-464d-93e1-2e768c08d273' FROM public.lecture_groups g WHERE g.name='2차 논술 강의';

INSERT INTO public.certificate_templates (course_id, title_text, description_text, issuer_name) VALUES
('110acf4d-53fc-49fd-afd3-cba703788961', '수료증', '위 사람은 노동법 총론 과정을 성실히 이수하였기에 이 증서를 수여합니다.', '웹헤즈 교육원'),
('ac01c822-0fa6-448e-be9e-86ad73010126', '수료증', '위 사람은 근로기준법 핵심정리 과정을 이수하였음을 증명합니다.', '웹헤즈 교육원'),
(NULL, '기본 수료증 양식', '위 사람은 해당 과정을 성실히 이수하였기에 이 증서를 수여합니다.', '웹헤즈 교육원');

INSERT INTO public.lesson_notes (user_id, content_id, note)
SELECT '9161a7db-b373-44fe-b85e-239647cdcb4a', c.id, '통상임금 판단 기준 3가지: 정기성·일률성·고정성' FROM public.course_contents c ORDER BY c.id LIMIT 1
ON CONFLICT (user_id, content_id) DO NOTHING;
INSERT INTO public.lesson_notes (user_id, content_id, note)
SELECT '9161a7db-b373-44fe-b85e-239647cdcb4a', c.id, '해고예고 30일 / 예고수당 30일분 — 시험 빈출' FROM public.course_contents c ORDER BY c.id OFFSET 1 LIMIT 1
ON CONFLICT (user_id, content_id) DO NOTHING;
INSERT INTO public.lesson_notes (user_id, content_id, note)
SELECT '50909407-7742-454d-b598-da687dbc25a8', c.id, '연차 발생: 1년 미만은 월 1일씩 최대 11일' FROM public.course_contents c ORDER BY c.id OFFSET 2 LIMIT 1
ON CONFLICT (user_id, content_id) DO NOTHING;

INSERT INTO public.sms_templates (template_key, label, body_template, description, enabled) VALUES
('enroll_done', '수강 신청 완료', '[웹헤즈] {{name}}님, {{course}} 수강 신청이 완료되었습니다.', '수강 신청 직후 발송', true),
('assignment_due', '과제 마감 임박', '[웹헤즈] {{name}}님, 과제 마감이 {{days}}일 남았습니다.', '마감 3일 전 발송', true),
('course_complete', '수료 안내', '[웹헤즈] {{name}}님, {{course}} 과정을 수료하셨습니다.', '수료 처리 시 발송', true);

INSERT INTO public.refund_policies (name, basis, is_default, is_active) VALUES
('기본 환불 정책(진도율 기준)', 'progress', true, true),
('기간 경과 기준 정책', 'period', false, true);

INSERT INTO public.community_badges (code, name, description, icon, color, sort_order, is_active) VALUES
('first_post', '첫 글 작성', '커뮤니티에 첫 글을 남겼습니다.', 'pencil', '#334155', 1, true),
('helper', '도움되는 답변가', '질문에 답변을 10회 이상 남겼습니다.', 'message-circle', '#0f766e', 2, true),
('streak_7', '7일 연속 학습', '7일 연속으로 학습을 이어갔습니다.', 'flame', '#b45309', 3, true);

INSERT INTO public.learning_nudge_rules (name, condition_type, threshold, channel, is_active, cooldown_days) VALUES
('3일 미접속 알림', 'inactive_days', 3, 'notification', true, 3),
('진도율 30% 미만 독려', 'low_progress', 30, 'email', true, 7),
('수료 임박 안내', 'near_completion', 90, 'notification', true, 5);

INSERT INTO public.ops_surveys (title, description, target_type, phase, questions, is_anonymous, is_active, opens_at, closes_at, created_by) VALUES
('오프라인 워크숍 만족도', '워크숍 종료 후 만족도를 조사합니다.', 'program', 'post', '[{"type":"rating","text":"전반적으로 만족하셨습니까?"},{"type":"text","text":"개선할 점을 적어주세요."}]'::jsonb, true, true, now() - interval '2 day', now() + interval '20 day', 'f61dbfb0-c75c-464d-93e1-2e768c08d273'),
('사전 학습 수요 조사', '개설 희망 과정을 조사합니다.', 'general', 'pre', '[{"type":"multiple_choice","text":"관심 분야는?","options":["노동법","인사관리","급여실무"]}]'::jsonb, false, true, now(), now() + interval '30 day', 'f61dbfb0-c75c-464d-93e1-2e768c08d273');
