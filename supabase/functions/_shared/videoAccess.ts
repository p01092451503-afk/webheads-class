// Shared entitlement check for signed video playback tokens.
// Prevents users who have not purchased / been approved for a course from
// obtaining a playback token for its videos.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type AccessResult = { allowed: true } | { allowed: false; reason: string };

export function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

async function isStaff(admin: ReturnType<typeof serviceClient>, userId: string) {
  const { data } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return (data ?? []).some((r: { role: string }) =>
    ["admin", "super_admin", "branch_admin", "teacher"].includes(r.role)
  );
}

/**
 * @param matchers list of OR filters used to locate the course_contents row(s)
 *                 that reference the requested media (PostgREST `or` syntax).
 */
export async function checkVideoAccess(
  userId: string,
  matchers: string,
): Promise<AccessResult> {
  const admin = serviceClient();

  if (await isStaff(admin, userId)) return { allowed: true };

  const { data: contents, error } = await admin
    .from("course_contents")
    .select("id, course_id, is_preview")
    .or(matchers);

  if (error) {
    console.error("videoAccess lookup error:", error.message);
    return { allowed: false, reason: "access check failed" };
  }

  if (!contents || contents.length === 0) {
    // Media not linked to any course content — only staff may play it.
    return { allowed: false, reason: "media not linked to any course" };
  }

  if (contents.some((c) => c.is_preview)) return { allowed: true };

  const courseIds = [...new Set(contents.map((c) => c.course_id).filter(Boolean))];
  if (courseIds.length === 0) return { allowed: false, reason: "no course mapping" };

  const { data: enrollments } = await admin
    .from("enrollments")
    .select("course_id")
    .eq("user_id", userId)
    .eq("status", "approved")
    .in("course_id", courseIds);

  if ((enrollments ?? []).length > 0) return { allowed: true };

  return { allowed: false, reason: "not enrolled" };
}
