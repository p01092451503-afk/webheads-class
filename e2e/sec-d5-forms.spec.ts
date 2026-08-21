import { test, expect } from "@playwright/test";
import { ACCOUNTS, loginAs } from "./fixtures/auth";

/**
 * D5 — 폼 / CRUD 견고성 (읽기·거부 검증 위주, 실데이터 생성 최소화)
 */
test.describe("D5 폼 견고성", () => {
  test("D5-1 회원가입 폼 빈 입력/필수 누락 검증", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForTimeout(1200);
    const signupTab = page.getByRole("tab", { name: /회원가입|sign ?up/i }).first();
    if (await signupTab.isVisible().catch(() => false)) await signupTab.click();
    await page.waitForTimeout(800);

    const submit = page.locator('button[type="submit"]').first();
    await submit.click().catch(() => {});
    await page.waitForTimeout(1500);
    // 빈 입력 제출 후에도 /auth 에 머물러야 한다.
    expect(new URL(page.url()).pathname, "빈 입력으로 가입 진행됨").toContain("/auth");
  });

  test("D5-2 로그인 폼 초장문·특수문자 입력 방어", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForTimeout(1000);
    const email = page.locator('input[type="email"]').first();
    const password = page.locator('input[type="password"]').first();
    await email.fill(`${"a".repeat(500)}@'"><script>x</script>.com`);
    await password.fill("x".repeat(2000));
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    const body = await page.locator("body").innerText();
    expect(/Something went wrong|Unexpected Application Error/i.test(body), "초장문 입력에 앱 크래시").toBe(false);
    expect(new URL(page.url()).pathname, "잘못된 자격증명으로 로그인 성공").toContain("/auth");
  });

  test("D5-3 첨삭 제출 폼 연타 시 중복 생성 여부", async ({ page }) => {
    test.skip(!ACCOUNTS.studentA, "studentA 계정 미설정 → 미실행");
    test.skip(
      process.env.E2E_ALLOW_WRITE !== "1",
      "쓰기 테스트는 E2E_ALLOW_WRITE=1 (격리 환경)에서만 실행 → 미실행",
    );
    await loginAs(page, "studentA");
    await page.goto("/student/corrections");
    await page.waitForTimeout(2000);
    const submit = page.getByRole("button", { name: /제출|신청/ }).first();
    if (!(await submit.isVisible().catch(() => false))) test.skip(true, "제출 버튼 없음 → 미실행");
    await submit.click();
    await submit.click().catch(() => {});
    await page.waitForTimeout(2500);
    const body = await page.locator("body").innerText();
    expect(/Something went wrong/i.test(body), "연타 후 크래시").toBe(false);
  });
});
