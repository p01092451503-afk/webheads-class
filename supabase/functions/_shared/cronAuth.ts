/**
 * 크론(스케줄러) 전용 함수 호출 검증.
 *
 * 예약 실행 함수들은 verify_jwt = false 로 배포되어 URL만 알면 누구나 호출할 수 있었다.
 * 아래 중 하나를 만족해야만 실행을 허용한다.
 *  1) x-cron-secret 헤더가 CRON_SECRET 과 일치
 *  2) Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 *  3) 관리자(admin / super_admin) 사용자 JWT — 운영자가 수동 실행하는 경우
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

const timingSafeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

export async function verifyCronRequest(req: Request): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const cronSecret = Deno.env.get("CRON_SECRET");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const provided = req.headers.get("x-cron-secret") ?? "";
  const bearer = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");

  if (cronSecret && provided && timingSafeEqual(provided, cronSecret)) return { ok: true };
  if (serviceKey && bearer && timingSafeEqual(bearer, serviceKey)) return { ok: true };

  if (bearer) {
    try {
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);
      const { data: userData } = await supabase.auth.getUser(bearer);
      const uid = userData?.user?.id;
      if (uid) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);
        if ((roles ?? []).some((r: { role: string }) => r.role === "admin" || r.role === "super_admin")) {
          return { ok: true };
        }
      }
    } catch {
      // fall through to unauthorized
    }
  }

  return { ok: false, status: 401, error: "unauthorized" };
}
