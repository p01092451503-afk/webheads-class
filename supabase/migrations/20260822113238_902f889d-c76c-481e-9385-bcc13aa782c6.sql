-- 1) 비로그인(anon) 사용자에 대한 전체 함수 실행 권한 회수
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- 2) 공개 페이지에서 반드시 필요한 함수만 다시 허용
GRANT EXECUTE ON FUNCTION public.verify_ops_certificate(text) TO anon;
GRANT EXECUTE ON FUNCTION public.search_articles(text, uuid, text, integer, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.recommend_articles(uuid, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_article_view(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.open_alert_count(uuid, uuid) TO anon;

-- 3) RLS 정책 평가에 사용되는 헬퍼 함수는 anon 에게도 실행 권한이 필요
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.is_branch_admin_of(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_dept_admin_of(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.has_branch_capability(uuid, uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.user_has_any_branch_capability(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_branch_id(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_branch_admin_branches(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.can_manage_correction_assignment(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_correction_assignment_target(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_video_session_host(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_video_session_participant(uuid, uuid) TO anon;

-- 4) 서버(엣지 함수·크론) 전용 함수는 로그인 사용자도 호출 불가
REVOKE EXECUTE ON FUNCTION public.seed_global_demo_data() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_oauth_tokens() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_points_and_coupons() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.publish_scheduled_articles() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.community_aggregate_daily_rankings(date) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.award_community_badge(uuid, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_points_by_policy(uuid, text, integer, text, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.issue_auto_coupon(uuid, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.confirm_payment_and_enroll(uuid, text, text) FROM authenticated;

-- 5) 서버 역할에는 항상 실행 권한 보장
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;