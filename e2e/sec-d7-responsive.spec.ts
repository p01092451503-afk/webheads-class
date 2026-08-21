import { test, expect } from "@playwright/test";

/**
 * D7 — 반응형 / 접근성 (375px 뷰포트 overflow 스캔)
 */
const MOBILE_SCREENS = ["/", "/store/courses", "/community", "/auth"];

test.use({ viewport: { width: 375, height: 812 } });

test.describe("D7 모바일 반응형", () => {
  for (const path of MOBILE_SCREENS) {
    test(`D7 ${path} — 가로 overflow 없음`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000);
      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const offenders: string[] = [];
        document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.right > docWidth + 2) {
            offenders.push(`${el.tagName.toLowerCase()}.${el.className?.toString().slice(0, 60)}`);
          }
        });
        return { docWidth, scrollWidth: document.documentElement.scrollWidth, offenders: offenders.slice(0, 8) };
      });
      expect(
        overflow.scrollWidth,
        `${path}: 가로 스크롤 발생 (scrollWidth ${overflow.scrollWidth} > ${overflow.docWidth})\n${overflow.offenders.join("\n")}`,
      ).toBeLessThanOrEqual(overflow.docWidth + 2);
    });
  }
});
