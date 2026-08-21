import { test, expect } from "@playwright/test";
import { ACCOUNTS, loginAs } from "./fixtures/auth";

/**
 * D4 — 세션 / Race Condition
 */
test.describe("D4 세션 · 경합", () => {
  test.skip(!ACCOUNTS.studentA, "studentA 계정 미설정 → 미실행");

  test("D4-1 보호 페이지 새로고침 반복 시 /auth 튕김 없음", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, "studentA");

    const bounces: string[] = [];
    for (let i = 0; i < 5; i += 1) {
      const seen: string[] = [];
      page.on("framenavigated", (f) => {
        if (f === page.mainFrame()) seen.push(new URL(f.url()).pathname);
      });
      await page.goto("/dashboard/courses");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2500);
      if (seen.some((p) => p.startsWith("/auth"))) bounces.push(`${i + 1}회차: ${seen.join(" → ")}`);
      page.removeAllListeners("framenavigated");
    }
    expect(bounces, `새로고침 시 인증 확인 전 리다이렉트 발생:\n${bounces.join("\n")}`).toEqual([]);
  });

  test("D4-2 뒤로/앞으로 + 새로고침 후 상태 정합성", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, "studentA");
    await page.goto("/dashboard/courses");
    await page.waitForTimeout(1500);
    await page.goto("/mypage");
    await page.waitForTimeout(1500);
    await page.goBack();
    await page.waitForTimeout(1200);
    await page.reload();
    await page.waitForTimeout(2000);
    await page.goForward();
    await page.waitForTimeout(2000);

    const body = await page.locator("body").innerText();
    expect(/Something went wrong|Unexpected Application Error/i.test(body), "히스토리 이동 후 에러 화면").toBe(false);
    expect(body.trim().length, "히스토리 이동 후 빈 화면").toBeGreaterThan(0);
  });

  test("D4-3 검색어 연속 변경 시 최신 결과 보장", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, "studentA");
    await page.goto("/catalog");
    await page.waitForTimeout(2000);
    const input = page.locator('input[type="search"], input[placeholder*="검색"]').first();
    if (!(await input.isVisible().catch(() => false))) test.skip(true, "검색 입력 없음 → 미실행");

    for (const q of ["a", "ab", "abc", "리더", "실무"]) {
      await input.fill(q);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(3000);
    const finalValue = await input.inputValue();
    expect(finalValue, "입력값 유실").toBe("실무");
    const body = await page.locator("body").innerText();
    expect(/Something went wrong/i.test(body), "검색 경합 중 크래시").toBe(false);
    test.info().annotations.push({
      type: "note",
      description: "이전 요청이 최신 결과를 덮어썼는지는 화면 텍스트만으로 단정 불가 — 스크린샷 수동 확인 필요",
    });
  });
});
