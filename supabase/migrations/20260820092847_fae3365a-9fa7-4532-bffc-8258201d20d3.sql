
INSERT INTO public.departments (name, code, display_order, is_active, entity_type) VALUES
('본사', 'HQ', 1, true, 'headquarters'),
('서울센터', 'SEOUL', 2, true, 'branch'),
('부산센터', 'BUSAN', 3, true, 'branch');

INSERT INTO public.instructor_profiles (user_id, headline, bio, expertise, years_experience, public_email) VALUES
('70b5fbdf-510b-445d-838c-e9aac69f6a64', '노동법 전임 강사', '현직 공인노무사로 10년간 노동법 강의를 진행해 왔습니다.', ARRAY['노동법','근로기준법'], 10, 'teacher1@example.com'),
('8c587b32-f0cf-4a61-a45b-2918032a8f3b', '인사노무 실무 강사', '대기업 인사팀 경력을 바탕으로 실무 중심 강의를 합니다.', ARRAY['인사관리','노무실무'], 8, 'teacher2@example.com'),
('24c0a245-f87e-41cf-a350-ad432b093c76', '2차 논술 첨삭 전문', '답안 작성 구조화와 첨삭 지도를 담당합니다.', ARRAY['논술','사례형'], 6, 'teacher3@example.com');

INSERT INTO public.coupons (code, name, discount_type, discount_value, min_order_amount, usage_limit, is_active, starts_at, ends_at) VALUES
('WELCOME10', '신규 가입 10% 할인', 'percent', 10, 0, 500, true, now() - interval '10 day', now() + interval '90 day'),
('SUMMER20000', '여름 특별 20,000원 할인', 'fixed', 20000, 100000, 200, true, now() - interval '5 day', now() + interval '30 day'),
('FRIEND15', '친구 추천 15% 할인', 'percent', 15, 50000, 100, true, now(), now() + interval '60 day');

INSERT INTO public.member_grades (name, code, rank, discount_percent, description, is_active) VALUES
('BASIC', 'basic', 1, 0, '기본 등급입니다.', true),
('SILVER', 'silver', 2, 5, '누적 수강 3개 이상 회원 등급입니다.', true),
('GOLD', 'gold', 3, 10, '누적 수강 6개 이상 회원 등급입니다.', true);

INSERT INTO public.subscription_plans (name, description, price, billing_period, billing_interval, trial_days, benefits, is_active, display_order) VALUES
('월간 무제한', '모든 강의를 한 달간 무제한 수강합니다.', 39000, 'month', 1, 7, '["전 강의 무제한","자료실 다운로드"]'::jsonb, true, 1),
('연간 무제한', '연 단위 결제로 2개월 무료 혜택을 제공합니다.', 390000, 'year', 1, 14, '["전 강의 무제한","1:1 첨삭 3회","수료증 발급"]'::jsonb, true, 2),
('베이직', '지정된 입문 강의만 수강 가능한 플랜입니다.', 19000, 'month', 1, 0, '["입문 강의 수강"]'::jsonb, true, 3);

INSERT INTO public.product_categories (name, slug, display_order, is_active) VALUES
('교재', 'books', 1, true),
('온라인 강의', 'online', 2, true),
('오프라인 특강', 'offline', 3, true);

INSERT INTO public.store_products (name, description, price, sale_price, stock_quantity, sale_status, is_active, display_order, product_type, category_id, author, publisher, requires_shipping, shipping_fee) VALUES
('노동법 총론 기본서', '강의와 함께 보는 공식 기본서입니다.', 32000, 28800, 120, 'on_sale', true, 1, 'book', (SELECT id FROM public.product_categories WHERE slug='books'), '김선영', '웹헤즈출판', true, 3000),
('근로기준법 문제집', '단원별 기출과 해설을 수록했습니다.', 24000, 24000, 80, 'on_sale', true, 2, 'book', (SELECT id FROM public.product_categories WHERE slug='books'), '이재훈', '웹헤즈출판', true, 3000),
('2차 논술 집중 특강(오프라인)', '주말 2일 집중 특강 과정입니다.', 180000, 150000, 30, 'presale', true, 3, 'general', (SELECT id FROM public.product_categories WHERE slug='offline'), NULL, NULL, false, 0);

INSERT INTO public.hero_banners (title, subtitle, cta_text, cta_url, image_url, bg_color, is_active, sort_order) VALUES
('2026 하반기 개강', '지금 등록하면 첫 달 수강료 20% 할인', '강의 둘러보기', '/store/classes', '/og-image.jpg', '#1f2937', true, 1),
('노무사 2차 논술 첨삭', '1:1 첨삭으로 답안이 달라집니다', '자세히 보기', '/store/classes', '/og-image.jpg', '#0f172a', true, 2),
('모바일에서도 이어서 학습', '언제 어디서나 학습 진도가 저장됩니다', '시작하기', '/auth', '/og-image.jpg', '#111827', true, 3);

INSERT INTO public.site_popups (title, content, position, width, height, start_at, end_at, is_active, display_order) VALUES
('하반기 개강 안내', '9월 1일 개강! 사전 등록 시 20% 할인 혜택을 드립니다.', 'center', 420, 320, now() - interval '1 day', now() + interval '30 day', true, 1),
('시스템 점검 안내', '8월 24일 02:00~04:00 서비스 점검이 예정되어 있습니다.', 'left', 380, 260, now() - interval '1 day', now() + interval '10 day', true, 2);

INSERT INTO public.static_pages (slug, title, content, meta_description, is_published, display_order) VALUES
('about', '서비스 소개', '웹헤즈 클래스는 온라인 학습부터 첨삭, 수료 관리까지 한 번에 제공하는 학습 플랫폼입니다.', '웹헤즈 클래스 서비스 소개', true, 1),
('terms', '이용약관', '제1조(목적) 본 약관은 서비스 이용에 관한 조건 및 절차를 규정함을 목적으로 합니다.', '서비스 이용약관', true, 2),
('privacy', '개인정보처리방침', '회사는 이용자의 개인정보를 관계 법령에 따라 안전하게 관리합니다.', '개인정보처리방침', true, 3);

INSERT INTO public.notifications (user_id, title, message, type, is_read, action_url) VALUES
('9161a7db-b373-44fe-b85e-239647cdcb4a', '새 과제가 등록되었습니다', '노동법 총론 · 1주차 과제를 확인하세요.', 'assignment', false, '/student/assignments'),
('9161a7db-b373-44fe-b85e-239647cdcb4a', '수료증이 발급되었습니다', '근로기준법 핵심정리 수료를 축하합니다.', 'certificate', false, '/student/certificates'),
('50909407-7742-454d-b598-da687dbc25a8', '학습 알림', '3일간 학습 기록이 없습니다. 이어서 학습해 보세요.', 'nudge', false, '/student/courses');

INSERT INTO public.reviews (user_id, course_id, rating, content, is_published) VALUES
('9161a7db-b373-44fe-b85e-239647cdcb4a', '110acf4d-53fc-49fd-afd3-cba703788961', 5, '체계적으로 정리되어 있어 처음 공부하는데 큰 도움이 됐습니다.', true),
('50909407-7742-454d-b598-da687dbc25a8', 'ac01c822-0fa6-448e-be9e-86ad73010126', 4, '사례 중심 설명이 좋았습니다. 자료도 충실합니다.', true),
('64170b22-a185-409e-8ccc-5b0d0b898986', 'b1295a0a-0bb4-45e0-b9a2-889bca41c2af', 5, '첨삭 피드백이 구체적이라 답안이 눈에 띄게 좋아졌습니다.', true);

INSERT INTO public.message_templates (name, channel, subject, body, variables, is_active, created_by) VALUES
('수강 신청 완료 안내', 'email', '[웹헤즈] 수강 신청이 완료되었습니다', '{{name}}님, {{course}} 수강 신청이 완료되었습니다. 학습을 시작해 보세요.', ARRAY['name','course'], true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273'),
('과제 마감 임박 알림', 'email', '[웹헤즈] 과제 마감이 곧 종료됩니다', '{{name}}님, {{assignment}} 과제 마감이 {{days}}일 남았습니다.', ARRAY['name','assignment','days'], true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273'),
('수료 축하 안내', 'email', '[웹헤즈] 수료를 축하합니다', '{{name}}님, {{course}} 과정을 수료하셨습니다. 수료증을 확인해 보세요.', ARRAY['name','course'], true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273');

INSERT INTO public.programs (title, description, category, location, capacity, starts_at, ends_at, apply_starts_at, apply_ends_at, manager_name, contact, status, is_public, created_by) VALUES
('노무 실무 워크숍', '실제 사례로 배우는 인사노무 실무 워크숍입니다.', '워크숍', '서울 강남 교육장', 40, now() + interval '20 day', now() + interval '21 day', now() - interval '5 day', now() + interval '15 day', '최지원', '02-000-0000', 'open', true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273'),
('2차 논술 합숙 캠프', '주말 1박 2일 집중 논술 캠프.', '캠프', '경기 용인 연수원', 25, now() + interval '35 day', now() + interval '36 day', now(), now() + interval '30 day', '정승호', '02-000-0001', 'open', true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273'),
('신입 인사담당자 기초과정', '입문자를 위한 3일 과정입니다.', '교육', '부산 센텀 교육장', 30, now() + interval '50 day', now() + interval '52 day', now(), now() + interval '45 day', '최지원', '051-000-0000', 'draft', false, 'f61dbfb0-c75c-464d-93e1-2e768c08d273');

INSERT INTO public.qualifications (name, code, grade, description, issuing_body, fee, validity_months, is_active, display_order) VALUES
('인사노무관리사', 'HRM-1', '1급', '인사노무 실무 역량을 인증하는 자격입니다.', '웹헤즈 교육원', 80000, 36, true, 1),
('노동법 실무사', 'LAW-2', '2급', '노동법 기본 이해도를 인증합니다.', '웹헤즈 교육원', 50000, 24, true, 2),
('급여관리 전문가', 'PAY-1', '1급', '급여 및 4대보험 실무 자격입니다.', '웹헤즈 교육원', 70000, 36, true, 3);

INSERT INTO public.exam_venues (name, address, region, capacity, contact, is_active) VALUES
('서울 강남 시험장', '서울시 강남구 테헤란로 123', '서울', 120, '02-111-2222', true),
('부산 센텀 시험장', '부산시 해운대구 센텀중앙로 45', '부산', 80, '051-333-4444', true),
('대전 둔산 시험장', '대전시 서구 둔산로 77', '대전', 60, '042-555-6666', true);

INSERT INTO public.evidence_categories (name, description, scope, is_required, sort_order, active, created_by) VALUES
('출석 증빙', '오프라인 교육 출석 확인 자료', 'program', true, 1, true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273'),
('수료 증빙', '수료증 및 이수 확인 서류', 'course', true, 2, true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273'),
('활동 사진', '교육 현장 사진 자료', 'program', false, 3, true, 'f61dbfb0-c75c-464d-93e1-2e768c08d273');

INSERT INTO public.video_sessions (title, description, session_type, host_user_id, scheduled_start, scheduled_end, status, max_participants, course_id) VALUES
('노동법 총론 실시간 Q&A', '1~5강 관련 질의응답 시간입니다.', 'lecture', '70b5fbdf-510b-445d-838c-e9aac69f6a64', now() + interval '3 day', now() + interval '3 day 1 hour', 'scheduled', 50, '110acf4d-53fc-49fd-afd3-cba703788961'),
('2차 논술 답안 리뷰', '제출 답안을 함께 리뷰합니다.', 'study', '24c0a245-f87e-41cf-a350-ad432b093c76', now() + interval '7 day', now() + interval '7 day 2 hour', 'scheduled', 30, 'b1295a0a-0bb4-45e0-b9a2-889bca41c2af'),
('1:1 학습 상담', '학습 계획 수립을 돕는 상담 세션입니다.', 'consultation', 'f61dbfb0-c75c-464d-93e1-2e768c08d273', now() + interval '1 day', now() + interval '1 day 40 minutes', 'scheduled', 5, NULL);
