import { test, expect } from "@playwright/test";
import { ACCOUNTS, callFunction, getRoles, getSession, loginAs, restQuery } from "./fixtures/auth";

/**
 * D1 — 권한 우회 / IDOR (CRITICAL)
 * 읽기 위주. 쓰기 시도는 "거부되어야 정상"인 경로만 수행한다.
 */

const ADMIN_URLS = [
  "/admin",
  "/admin/users",
  "/admin/orders",
  "/admin/refunds",
  "/admin/settlements",
];

test.describe("D1 권한 우회 / IDOR", () => {
  test.skip(!ACCOUNTS.studentA, "studentA 계정 미설정 → 미실행");

  test("D1-1 학생 세션으로 관리자 URL 직접 진입 시 차단", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, "studentA");
    const s = await getSession(page);
    const roles = await getRoles(page, s.accessToken, s.userId);
    test.skip(
      roles.some((r) => r !== "student"),
      `studentA 계정이 학생 전용이 아님(roles=${roles.join(",") || "none"}) → 미실행`,
    );

    const leaks: string[] = [];
    for (const url of ADMIN_URLS) {
      await page.goto(url);
      await page.waitForLoadState("domcontentloaded");
      // 리다이렉트 전 순간 노출 감지: 짧은 간격으로 본문을 샘플링한다.
      const samples: string[] = [];
      for (let i = 0; i < 6; i += 1) {
        samples.push(((await page.locator("body").innerText().catch(() => "")) || "").slice(0, 4000));
        await page.waitForTimeout(150);
      }
      await page.waitForTimeout(1500);
      const finalUrl = new URL(page.url()).pathname;
      const stayed = finalUrl.startsWith("/admin");
      const flashed = samples.some((s) => /회원 관리|주문 관리|환불|정산|사용자 목록/.test(s));
      if (stayed) leaks.push(`${url} → 리다이렉트 없음(최종 ${finalUrl})`);
      else if (flashed) leaks.push(`${url} → 리다이렉트 전 관리자 데이터 순간 노출`);
    }
    expect(leaks, `관리자 화면 접근 통제 실패:\n${leaks.join("\n")}`).toEqual([]);
  });

  test("D1-2 타 사용자 행 직접 SELECT/UPDATE (RLS)", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, "studentA");
    const { accessToken, userId } = await getSession(page);
    const roles = await getRoles(page, accessToken, userId);
    test.skip(
      roles.some((r) => r !== "student"),
      `studentA 계정이 학생 전용이 아님(roles=${roles.join(",") || "none"}) → 미실행`,
    );

    const tables = [
      { table: "orders", col: "user_id" },
      { table: "enrollments", col: "user_id" },
      { table: "profiles", col: "id" },
      { table: "point_transactions", col: "user_id" },
      { table: "correction_requests", col: "student_id" },
    ];

    const leaks: string[] = [];
    for (const { table, col } of tables) {
      const res = await restQuery(page, {
        table,
        query: `select=*&${col}=neq.${userId}&limit=3`,
        accessToken,
      });
      if (res.status === 200) {
        const rows = JSON.parse(res.body || "[]");
        if (Array.isArray(rows) && rows.length > 0) {
          leaks.push(`${table}: 타인 행 ${rows.length}건 읽힘 (${res.status})`);
        }
      }
      // 쓰기 시도(거부되어야 정상). 성공 시 CRITICAL.
      const upd = await restQuery(page, {
        table,
        query: `${col}=neq.${userId}&limit=1`,
        method: "PATCH",
        body: table === "profiles" ? { full_name: "e2e-should-fail" } : { updated_at: new Date().toISOString() },
        accessToken,
      });
      if (upd.status < 300) {
        const rows = JSON.parse(upd.body || "[]");
        if (Array.isArray(rows) && rows.length > 0) leaks.push(`${table}: 타인 행 UPDATE 성공(${upd.status})`);
      }
    }
    expect(leaks, `RLS 격리 실패:\n${leaks.join("\n")}`).toEqual([]);
  });

  test("D1-3 /oapi/* 무토큰·잘못된 토큰 호출", async ({ page }) => {
    await page.goto("/");
    const fns = ["api-students", "api-orders", "api-members-detail"];
    const bad: string[] = [];
    for (const name of fns) {
      const noToken = await callFunction(page, { name });
      if (noToken.status < 400 && !/"code"\s*:\s*"1[12]"/.test(noToken.body)) {
        bad.push(`${name} (토큰 없음): ${noToken.status} ${noToken.body.slice(0, 200)}`);
      }
      const wrong = await callFunction(page, { name, token: "invalid.token.value" });
      if (wrong.status < 400 && !/"code"\s*:\s*"(11|12|99)"/.test(wrong.body)) {
        bad.push(`${name} (잘못된 토큰): ${wrong.status} ${wrong.body.slice(0, 200)}`);
      }
    }
    expect(bad, `OAPI 인증 미차단:\n${bad.join("\n")}`).toEqual([]);
  });

  test("D1-4 OAPI 검색 인젝션 (api-students?search=)", async ({ page }) => {
    await page.goto("/");
    const payloads = ["%25", ")", ",email.neq.null", "*", "a,id.gte.0"];
    const problems: string[] = [];
    for (const payload of payloads) {
      const res = await callFunction(page, {
        name: "api-students",
        query: `search=${encodeURIComponent(payload)}`,
        token: process.env.E2E_OAPI_TOKEN ?? null,
      });
      // 토큰이 없으면 인증 거부(정상). 500 은 파서 폭발 = 인젝션 신호.
      if (res.status >= 500) problems.push(`search=${payload} → ${res.status} ${res.body.slice(0, 200)}`);
    }
    expect(problems, `검색 인젝션 의심 응답:\n${problems.join("\n")}`).toEqual([]);
    test.info().annotations.push({
      type: "note",
      description: process.env.E2E_OAPI_TOKEN
        ? "유효 OAPI 토큰으로 실행됨"
        : "E2E_OAPI_TOKEN 미설정 → 인증 단계까지만 검증(전체 행 유출 여부는 미실행)",
    });
  });
});
