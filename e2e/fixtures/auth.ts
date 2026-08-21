import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

/**
 * 역할별 로그인 fixture.
 *
 * 계정은 환경변수로 주입한다(운영 계정 금지, 격리된 테스트 계정만 사용).
 *   E2E_STUDENT_EMAIL / E2E_STUDENT_PASSWORD  (기본: 데모 계정)
 *   E2E_STUDENT_B_EMAIL / E2E_STUDENT_B_PASSWORD
 *   E2E_TEACHER_EMAIL / E2E_TEACHER_PASSWORD
 *   E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD
 * 미설정 역할의 테스트는 skip(=미실행) 처리된다.
 */
export type RoleKey = "studentA" | "studentB" | "teacher" | "admin";

export type Account = { email: string; password: string } | null;

function acc(emailVar: string, passVar: string, fallback?: [string, string]): Account {
  const email = process.env[emailVar] ?? fallback?.[0];
  const password = process.env[passVar] ?? fallback?.[1];
  if (!email || !password) return null;
  return { email, password };
}

export const ACCOUNTS: Record<RoleKey, Account> = {
  studentA: acc("E2E_STUDENT_EMAIL", "E2E_STUDENT_PASSWORD", ["test@test.co.kr", "test1234"]),
  studentB: acc("E2E_STUDENT_B_EMAIL", "E2E_STUDENT_B_PASSWORD"),
  teacher: acc("E2E_TEACHER_EMAIL", "E2E_TEACHER_PASSWORD"),
  admin: acc("E2E_ADMIN_EMAIL", "E2E_ADMIN_PASSWORD"),
};

/** .env 에서 Supabase 공개 설정을 읽어온다(테스트 런타임은 Vite 환경이 아님). */
export function readSupabaseEnv(): { url: string; anonKey: string } {
  const fromProc = {
    url: process.env.VITE_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
  if (fromProc.url && fromProc.anonKey) return { url: fromProc.url, anonKey: fromProc.anonKey };

  const envPath = path.resolve(process.cwd(), ".env");
  const raw = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const get = (key: string) => raw.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1]?.trim() ?? "";
  return { url: get("VITE_SUPABASE_URL"), anonKey: get("VITE_SUPABASE_PUBLISHABLE_KEY") };
}

/** UI 로그인. 성공하면 /auth 를 벗어난다. */
export async function loginAs(page: Page, role: RoleKey): Promise<void> {
  const account = ACCOUNTS[role];
  if (!account) throw new Error(`계정 미설정: ${role}`);

  await page.goto("/auth");
  await page.waitForLoadState("domcontentloaded");
  const email = page.locator('input[type="email"]').first();
  const password = page.locator('input[type="password"]').first();
  await email.waitFor({ state: "visible", timeout: 20_000 });
  await email.fill(account.email);
  await password.fill(account.password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 30_000 });
}

export type SessionInfo = { accessToken: string; userId: string };

/** 로그인된 페이지의 localStorage 에서 supabase 세션을 추출한다. */
export async function getSession(page: Page): Promise<SessionInfo> {
  return await page.evaluate(() => {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)!;
      if (!key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const parsed = JSON.parse(window.localStorage.getItem(key) || "{}");
      if (parsed?.access_token) {
        return { accessToken: parsed.access_token as string, userId: parsed.user?.id as string };
      }
    }
    throw new Error("supabase 세션을 찾지 못했습니다 (로그인 실패?)");
  });
}

/** 사용자 세션 토큰으로 PostgREST 를 직접 호출한다(RLS 검증용). */
export async function restQuery(
  page: Page,
  opts: {
    table: string;
    query?: string;
    method?: "GET" | "PATCH" | "DELETE";
    body?: unknown;
    accessToken: string;
  },
): Promise<{ status: number; body: string }> {
  const { url, anonKey } = readSupabaseEnv();
  const target = `${url}/rest/v1/${opts.table}${opts.query ? `?${opts.query}` : ""}`;
  return await page.evaluate(
    async ({ target, anonKey, token, method, body }) => {
      const res = await fetch(target, {
        method,
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      return { status: res.status, body: (await res.text()).slice(0, 2000) };
    },
    {
      target,
      anonKey,
      token: opts.accessToken,
      method: opts.method ?? "GET",
      body: opts.body ?? null,
    },
  );
}

/** Edge Function 직접 호출(토큰/스코프 검증용). */
export async function callFunction(
  page: Page,
  opts: {
    name: string;
    query?: string;
    method?: string;
    token?: string | null;
    body?: unknown;
  },
): Promise<{ status: number; body: string }> {
  const { url, anonKey } = readSupabaseEnv();
  const target = `${url}/functions/v1/${opts.name}${opts.query ? `?${opts.query}` : ""}`;
  return await page.evaluate(
    async ({ target, anonKey, token, method, body }) => {
      const headers: Record<string, string> = {
        apikey: anonKey,
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      try {
        const res = await fetch(target, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
        return { status: res.status, body: (await res.text()).slice(0, 2000) };
      } catch (err) {
        // 함수 미배포/CORS 프리플라이트 거부 → 호출 불가(=노출 없음)로 기록
        return { status: 0, body: `network-error: ${String(err)}` };
      }
    },
    { target, anonKey, token: opts.token ?? null, method: opts.method ?? "GET", body: opts.body ?? null },
  );
}

/** 현재 세션 사용자의 역할 목록. */
export async function getRoles(page: Page, accessToken: string, userId: string): Promise<string[]> {
  const res = await restQuery(page, {
    table: "user_roles",
    query: `select=role&user_id=eq.${userId}`,
    accessToken,
  });
  if (res.status !== 200) return [];
  return (JSON.parse(res.body || "[]") as { role: string }[]).map((r) => r.role);
}
