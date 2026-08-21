import { test, expect } from "@playwright/test";
import { ACCOUNTS, callFunction, getSession, loginAs, restQuery } from "./fixtures/auth";

/**
 * D2 — 결제 이중/변조 (CRITICAL)
 * 실결제는 절대 수행하지 않는다. 결제창 진입 직전까지만 검증한다.
 */
test.describe("D2 결제 이중/변조", () => {
  test.skip(!ACCOUNTS.studentA, "studentA 계정 미설정 → 미실행");

  test("D2-1 결제 버튼 연타 시 주문 중복 생성 여부", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, "studentA");
    const { accessToken, userId } = await getSession(page);

    const before = await restQuery(page, {
      table: "orders",
      query: `select=id&user_id=eq.${userId}`,
      accessToken,
    });
    const beforeCount = JSON.parse(before.body || "[]").length;

    await page.goto("/cart");
    await page.waitForTimeout(1500);
    const checkout = page
      .getByRole("button", { name: /주문|결제|checkout/i })
      .first();
    if (!(await checkout.isVisible().catch(() => false))) {
      test.skip(true, "장바구니가 비어 결제 진입 불가 → 미실행");
    }
    await checkout.click();
    await page.waitForTimeout(2000);

    const pay = page.getByRole("button", { name: /결제하기|결제 진행|pay/i }).first();
    if (!(await pay.isVisible().catch(() => false))) {
      test.skip(true, "결제 버튼 미노출 → 미실행");
    }
    // 연타
    await pay.click({ force: true });
    await pay.click({ force: true }).catch(() => {});
    await pay.click({ force: true }).catch(() => {});
    await page.waitForTimeout(4000);

    const after = await restQuery(page, {
      table: "orders",
      query: `select=id&user_id=eq.${userId}`,
      accessToken,
    });
    const afterCount = JSON.parse(after.body || "[]").length;
    expect(
      afterCount - beforeCount,
      `연타 3회 후 생성된 주문 수 (기대: 최대 1건)`,
    ).toBeLessThanOrEqual(1);
  });

  test("D2-2 결제 확정 API 금액 변조 거부", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, "studentA");
    const { accessToken } = await getSession(page);

    // 실제 paymentKey 없이 호출 → 서버는 400/401 로 거부해야 한다.
    const res = await callFunction(page, {
      name: "toss-payment-confirm",
      method: "POST",
      token: accessToken,
      body: { paymentKey: "e2e-fake-key", orderId: "e2e-fake-order", amount: 100 },
    });
    expect(res.status, `기대: 4xx 거부 / 실제: ${res.status} ${res.body.slice(0, 300)}`).toBeGreaterThanOrEqual(400);
    test.info().annotations.push({
      type: "note",
      description:
        "실주문 기반 금액 변조(정상 orderId + 조작 amount)는 실결제 위험으로 미실행. 정적 감사 C-1 참조.",
    });
  });
});
