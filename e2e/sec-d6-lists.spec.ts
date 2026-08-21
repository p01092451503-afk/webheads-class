import { test, expect } from "@playwright/test";
import { ACCOUNTS, loginAs } from "./fixtures/auth";

/**
 * D6 — 목록 / 페이지네이션 / 필터
 */
const LIST_PAGES = ["/catalog", "/store/courses", "/community"];

test.describe("D6 목록 · 페이지네이션", () => {
  test("D6-1 검색 결과 없음 상태 처리", async ({ page }) => {
    for (const path of LIST_PAGES) {
      await page.goto(path);
      await page.waitForTimeout(1800);
      const input = page.locator('input[type="search"], input[placeholder*="검색"]').first();
      if (!(await input.isVisible().catch(() => false))) continue;
      await input.fill("zzzzqqqxx-nonexistent-999");
      await page.waitForTimeout(2500);
      const body = await page.locator("body").innerText();
      expect(/Something went wrong/i.test(body), `${path}: 빈 결과에서 크래시`).toBe(false);
      expect(body.trim().length, `${path}: 빈 결과에서 화면 공백`).toBeGreaterThan(50);
    }
  });

  test("D6-2 페이지 이동 후 이전 페이지 데이터 잔존 여부", async ({ page }) => {
    test.skip(!ACCOUNTS.studentA, "studentA 계정 미설정 → 미실행");
    await loginAs(page, "studentA");
    await page.goto("/catalog");
    await page.waitForTimeout(2500);
    const first = (await page.locator("main, #root").first().innerText()).slice(0, 1500);
    const next = page.getByRole("button", { name: /다음|next/i }).first();
    if (!(await next.isVisible().catch(() => false))) test.skip(true, "페이지네이션 없음 → 미실행");
    await next.click();
    await page.waitForTimeout(2500);
    const second = (await page.locator("main, #root").first().innerText()).slice(0, 1500);
    expect(second, "다음 페이지에서 동일 데이터 잔존").not.toBe(first);
  });
});
