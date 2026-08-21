import { test, expect } from "@playwright/test";
import { ACCOUNTS, callFunction, getSession, loginAs, restQuery } from "./fixtures/auth";

/**
 * D3 — 유료 콘텐츠 무단 접근 (HIGH)
 */
test.describe("D3 유료 콘텐츠 접근 통제", () => {
  test.skip(!ACCOUNTS.studentA, "studentA 계정 미설정 → 미실행");

  test("D3-1 미수강 강의 영상 토큰 발급 거부", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, "studentA");
    const { accessToken, userId } = await getSession(page);

    const enrolled = JSON.parse(
      (await restQuery(page, { table: "enrollments", query: `select=course_id&user_id=eq.${userId}`, accessToken })).body ||
        "[]",
    ).map((r: { course_id: string }) => r.course_id);

    const courses = JSON.parse(
      (await restQuery(page, { table: "courses", query: "select=id&limit=50", accessToken })).body || "[]",
    ) as { id: string }[];
    const target = courses.find((c) => !enrolled.includes(c.id));
    if (!target) test.skip(true, "미수강 강의를 찾지 못함 → 미실행");

    const videos = JSON.parse(
      (
        await restQuery(page, {
          table: "content_videos",
          query: `select=*&limit=5`,
          accessToken,
        })
      ).body || "[]",
    ) as Record<string, unknown>[];

    const results: string[] = [];
    for (const fn of ["bunny-video-token", "kollus-video-token", "daily-join-token"]) {
      const res = await callFunction(page, {
        name: fn,
        method: "POST",
        token: accessToken,
        body: {
          course_id: target!.id,
          video_guid: (videos[0]?.video_guid as string) ?? "e2e-unknown-guid",
          content_id: (videos[0]?.content_id as string) ?? "e2e-unknown",
        },
      });
      if (res.status < 400 && /token|url|jwt/i.test(res.body)) {
        results.push(`${fn}: 미수강 상태로 토큰 발급됨 (${res.status})`);
      }
    }
    expect(results, `유료 영상 토큰 무단 발급:\n${results.join("\n")}`).toEqual([]);
    test.info().annotations.push({
      type: "note",
      description: `content_videos 조회 결과 ${videos.length}건 (0건이면 RLS로 차단된 상태)`,
    });
  });

  test("D3-2 consume-otl-token 1회용 링크 재사용 거부", async ({ page }) => {
    await page.goto("/");
    const token = process.env.E2E_OTL_TOKEN;
    test.skip(!token, "E2E_OTL_TOKEN 미설정 → 미실행 (1회용 링크 발급 필요)");

    const first = await callFunction(page, {
      name: "consume-otl-token",
      method: "POST",
      body: { token },
    });
    const second = await callFunction(page, {
      name: "consume-otl-token",
      method: "POST",
      body: { token },
    });
    expect(
      second.status,
      `두 번째 사용은 거부되어야 함. 1차:${first.status} 2차:${second.status} ${second.body.slice(0, 200)}`,
    ).toBeGreaterThanOrEqual(400);
  });
});
