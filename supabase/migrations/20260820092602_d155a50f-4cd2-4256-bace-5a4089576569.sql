
-- 공지사항
INSERT INTO public.announcements (title, content, category, is_pinned, is_published, author_id) VALUES
('2026년 하반기 학습 일정 안내', '하반기 정규 과정 개강일은 9월 1일입니다. 수강 신청은 8월 25일까지 완료해 주세요.', '일반', true, true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273'),
('시스템 정기 점검 안내 (8/24 02:00~04:00)', '서비스 안정화를 위한 정기 점검이 진행됩니다. 해당 시간에는 학습 진도가 저장되지 않을 수 있습니다.', '시스템', false, true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273'),
('모바일 학습 앱 설치 방법 안내', '브라우저 메뉴에서 홈 화면에 추가를 선택하면 앱처럼 사용할 수 있습니다.', '가이드', false, true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273');

-- 게시판(자료실)
INSERT INTO public.board_posts (title, content, author_id, is_pinned, is_published, view_count) VALUES
('노동법 총론 요약 노트 배포', '1강~5강 핵심 요약본을 공유합니다. 시험 대비 시 참고하세요.', 'f61dbfb0-c75c-464d-93e1-2e768c08d273', true, true, 132),
('2차 논술 답안 작성 템플릿', '서론-본론-결론 구조의 표준 답안 템플릿입니다.', '70b5fbdf-510b-445d-838c-e9aac69f6a64', false, true, 87),
('수강 중 자주 묻는 질문 모음', '진도율, 수료 기준, 증명서 발급 관련 FAQ를 정리했습니다.', 'f61dbfb0-c75c-464d-93e1-2e768c08d273', false, true, 245);

-- 커뮤니티 카테고리 + 게시글
INSERT INTO public.community_categories (name, slug, description, sort_order, is_active) VALUES
('자유게시판', 'free', '자유롭게 이야기를 나누는 공간입니다.', 1, true),
('질문과 답변', 'qna', '학습 중 궁금한 점을 질문해 보세요.', 2, true),
('합격 후기', 'review', '학습 경험과 합격 후기를 공유합니다.', 3, true);

INSERT INTO public.community_posts (category_id, author_id, title, content, view_count) VALUES
((SELECT id FROM public.community_categories WHERE slug='free'), '9161a7db-b373-44fe-b85e-239647cdcb4a', '평일 저녁 스터디 함께 하실 분', '주 2회 온라인으로 진도 점검하는 스터디를 모집합니다.', 41),
((SELECT id FROM public.community_categories WHERE slug='qna'), '50909407-7742-454d-b598-da687dbc25a8', '근로기준법 3강 판례 질문 있습니다', '통상임금 판단 기준 관련해서 최근 판례와 강의 내용이 조금 달라 보여서 여쭙습니다.', 63),
((SELECT id FROM public.community_categories WHERE slug='review'), '64170b22-a185-409e-8ccc-5b0d0b898986', '6개월 완주 후기 남깁니다', '하루 2시간씩 꾸준히 들었더니 진도율 100% 달성했습니다. 팁 공유드려요.', 158);

INSERT INTO public.community_comments (post_id, author_id, content)
SELECT p.id, '9c6c566c-e4bc-4d06-b80a-298cf256f9f9', '좋은 글 감사합니다. 저도 참고할게요!' FROM public.community_posts p LIMIT 3;

-- 과제
INSERT INTO public.assignments (course_id, title, description, instructions, due_date, max_score, status, allow_late_submission, created_by) VALUES
('110acf4d-53fc-49fd-afd3-cba703788961', '1주차 과제 - 노동법 체계 정리', '노동법의 기본 체계를 A4 1장으로 정리해 제출하세요.', '개조식으로 작성하고 참고 문헌을 표기합니다.', now() + interval '7 day', 100, 'published', true, '70b5fbdf-510b-445d-838c-e9aac69f6a64'),
('ac01c822-0fa6-448e-be9e-86ad73010126', '사례형 문제 풀이 제출', '제시된 부당해고 사례를 분석해 결론을 도출하세요.', '쟁점-법리-결론 순서로 작성합니다.', now() + interval '14 day', 100, 'published', false, '8c587b32-f0cf-4a61-a45b-2918032a8f3b'),
('b1295a0a-0bb4-45e0-b9a2-889bca41c2af', '2차 논술 모의 답안', '기출 문제 1문항에 대한 논술 답안을 작성합니다.', '분량은 2,000자 내외로 제한합니다.', now() + interval '21 day', 50, 'published', true, '24c0a245-f87e-41cf-a350-ad432b093c76');

-- 평가 + 문항
INSERT INTO public.assessments (course_id, title, description, passing_score, max_attempts, time_limit_minutes, is_published, created_by) VALUES
('110acf4d-53fc-49fd-afd3-cba703788961', '노동법 총론 중간 평가', '1~5강 학습 내용을 확인하는 평가입니다.', 70, 3, 30, true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273'),
('ac01c822-0fa6-448e-be9e-86ad73010126', '근로기준법 최종 평가', '수료 요건에 해당하는 최종 평가입니다.', 80, 2, 40, true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273'),
('06775197-351f-4b08-8466-1a13407f991e', '인사노무관리론 형성 평가', '학습 이해도를 점검하는 간단한 평가입니다.', 60, 5, 20, true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273');

INSERT INTO public.assessment_questions (assessment_id, question_type, question_text, options, correct_answer, points, order_index, explanation)
SELECT a.id, 'multiple_choice_4', '근로기준법상 법정 근로시간은 1주 몇 시간인가?', '["36시간","40시간","44시간","48시간"]'::jsonb, '40시간', 10, 1, '1주 40시간, 1일 8시간이 원칙입니다.' FROM public.assessments a WHERE a.title='노동법 총론 중간 평가';
INSERT INTO public.assessment_questions (assessment_id, question_type, question_text, options, correct_answer, points, order_index, explanation)
SELECT a.id, 'ox', '연차유급휴가는 1년 미만 근로자에게는 발생하지 않는다.', '["O","X"]'::jsonb, 'X', 10, 2, '1년 미만 근로자도 월 단위로 연차가 발생합니다.' FROM public.assessments a WHERE a.title='노동법 총론 중간 평가';
INSERT INTO public.assessment_questions (assessment_id, question_type, question_text, options, correct_answer, points, order_index, explanation)
SELECT a.id, 'short_answer', '해고를 하려면 최소 며칠 전에 예고해야 하는가?', NULL, '30일', 10, 1, '해고예고 기간은 30일입니다.' FROM public.assessments a WHERE a.title='근로기준법 최종 평가';

-- 설문
INSERT INTO public.surveys (course_id, title, description, is_active, created_by) VALUES
('110acf4d-53fc-49fd-afd3-cba703788961', '노동법 총론 만족도 조사', '강의 품질 개선을 위한 설문입니다.', true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273'),
('ac01c822-0fa6-448e-be9e-86ad73010126', '근로기준법 수료 설문', '수료 후 의견을 들려주세요.', true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273');

INSERT INTO public.survey_questions (survey_id, question_type, question_text, options, order_index, is_required)
SELECT s.id, 'rating', '강의 전반에 대해 얼마나 만족하시나요?', NULL, 1, true FROM public.surveys s WHERE s.title='노동법 총론 만족도 조사';
INSERT INTO public.survey_questions (survey_id, question_type, question_text, options, order_index, is_required)
SELECT s.id, 'multiple_choice', '가장 도움이 된 부분은 무엇인가요?', '["강의 영상","자료실 문서","평가 문항","커뮤니티"]'::jsonb, 2, true FROM public.surveys s WHERE s.title='노동법 총론 만족도 조사';
INSERT INTO public.survey_questions (survey_id, question_type, question_text, options, order_index, is_required)
SELECT s.id, 'text', '개선이 필요한 점을 자유롭게 적어주세요.', NULL, 1, false FROM public.surveys s WHERE s.title='근로기준법 수료 설문';

-- 아티클
INSERT INTO public.article_categories (slug, name, sort_order, is_active) VALUES
('law-news', '법령 소식', 1, true),
('study-tip', '학습 팁', 2, true),
('career', '커리어', 3, true);

INSERT INTO public.articles (title, slug, summary, body, category_id, status, published_at, author_id, view_count)
VALUES
('2026년 최저임금 확정, 실무 체크포인트', 'minimum-wage-2026', '최저임금 인상에 따라 사업장에서 점검해야 할 사항을 정리했습니다.', '최저임금 인상은 임금 구조 전반에 영향을 줍니다. 통상임금 산정, 각종 수당 재설계, 취업규칙 정비 순으로 점검하시기 바랍니다.', (SELECT id FROM public.article_categories WHERE slug='law-news'), 'published', now() - interval '3 day', 'f61dbfb0-c75c-464d-93e1-2e768c08d273', 421),
('진도율 100%를 만드는 3가지 습관', 'study-habit-3', '완주율이 높은 학습자들의 공통점을 분석했습니다.', '첫째 매일 같은 시간에 학습하기, 둘째 한 차시를 끝내고 바로 요약하기, 셋째 주 1회 복습 퀴즈 풀기입니다.', (SELECT id FROM public.article_categories WHERE slug='study-tip'), 'published', now() - interval '10 day', '70b5fbdf-510b-445d-838c-e9aac69f6a64', 288),
('인사담당자로 성장하는 커리어 로드맵', 'hr-career-roadmap', '주니어에서 시니어까지 단계별 역량 정리.', '입사 3년차까지는 근태·급여 실무, 이후에는 채용과 평가 제도 설계 경험을 쌓는 것이 좋습니다.', (SELECT id FROM public.article_categories WHERE slug='career'), 'published', now() - interval '20 day', '8c587b32-f0cf-4a61-a45b-2918032a8f3b', 176);

-- 학습 트랙
INSERT INTO public.learning_tracks (name, description, is_active, sort_order, created_by) VALUES
('노무사 1차 기본 과정', '노동법 기초부터 사회보험법까지 순차적으로 학습하는 입문 트랙입니다.', true, 1, 'f61dbfb0-c75c-464d-93e1-2e768c08d273'),
('노무사 2차 심화 과정', '논술과 사례형 문제 해결 능력을 기르는 심화 트랙입니다.', true, 2, 'f61dbfb0-c75c-464d-93e1-2e768c08d273'),
('기업 인사담당자 실무 과정', '실무에 바로 적용 가능한 인사·노무 관리 트랙입니다.', true, 3, 'f61dbfb0-c75c-464d-93e1-2e768c08d273');

INSERT INTO public.track_steps (track_id, name, description, level_order, unlock_previous_required)
SELECT t.id, '1단계 · 기초 다지기', '노동법 총론과 근로기준법을 학습합니다.', 1, false FROM public.learning_tracks t WHERE t.name='노무사 1차 기본 과정';
INSERT INTO public.track_steps (track_id, name, description, level_order, unlock_previous_required)
SELECT t.id, '2단계 · 확장 학습', '사회보험법과 노동조합법을 학습합니다.', 2, true FROM public.learning_tracks t WHERE t.name='노무사 1차 기본 과정';
INSERT INTO public.track_steps (track_id, name, description, level_order, unlock_previous_required)
SELECT t.id, '1단계 · 논술 기초', '답안 구조 설계와 표현 훈련.', 1, false FROM public.learning_tracks t WHERE t.name='노무사 2차 심화 과정';

INSERT INTO public.track_step_courses (step_id, course_id, sort_order, is_required)
SELECT s.id, '110acf4d-53fc-49fd-afd3-cba703788961', 1, true FROM public.track_steps s WHERE s.name='1단계 · 기초 다지기';
INSERT INTO public.track_step_courses (step_id, course_id, sort_order, is_required)
SELECT s.id, 'ac01c822-0fa6-448e-be9e-86ad73010126', 2, true FROM public.track_steps s WHERE s.name='1단계 · 기초 다지기';
INSERT INTO public.track_step_courses (step_id, course_id, sort_order, is_required)
SELECT s.id, '5ebcac2e-3e78-4ba0-9e4c-a2b71673f60d', 1, true FROM public.track_steps s WHERE s.name='2단계 · 확장 학습';
INSERT INTO public.track_step_courses (step_id, course_id, sort_order, is_required)
SELECT s.id, 'b1295a0a-0bb4-45e0-b9a2-889bca41c2af', 1, true FROM public.track_steps s WHERE s.name='1단계 · 논술 기초';

-- 마이크로러닝
INSERT INTO public.micro_contents (title, description, video_url, video_provider, duration_seconds, category, is_published, display_order, view_count, linked_course_id) VALUES
('3분 정리 · 통상임금이란?', '통상임금의 개념과 판단 기준을 짧게 정리했습니다.', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'youtube', 180, '노동법', true, 1, 312, '110acf4d-53fc-49fd-afd3-cba703788961'),
('5분 정리 · 연차휴가 계산법', '입사 1년 미만과 이후의 연차 발생 기준을 비교합니다.', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'youtube', 300, '노동법', true, 2, 254, 'ac01c822-0fa6-448e-be9e-86ad73010126'),
('2분 정리 · 4대보험 가입 기준', '사업장 가입 요건을 빠르게 확인합니다.', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'youtube', 120, '사회보험', true, 3, 198, '5ebcac2e-3e78-4ba0-9e4c-a2b71673f60d');
