// 회원 검색 공통 유틸 — 모든 회원 검색 UI가 동일한 항목(이름·이메일·연락처·사번)으로 검색되도록 통일한다.

export const MEMBER_SEARCH_FIELDS = ["full_name", "email", "phone_number", "employee_id"] as const;

export const MEMBER_SEARCH_PLACEHOLDER = "이름·이메일·연락처·사번 검색";

const digitsOnly = (value: string) => value.replace(/[^0-9]/g, "");

/** Supabase `.or()`에 넣을 검색 조건 문자열을 만든다. */
export function memberSearchOrFilter(term: string, fields: readonly string[] = MEMBER_SEARCH_FIELDS) {
  const q = term.trim().replace(/[,()]/g, " ");
  if (!q) return "";
  return fields.map((f) => `${f}.ilike.%${q}%`).join(",");
}

/** 클라이언트 측 필터링용 매처. 전화번호는 하이픈을 무시하고 비교한다. */
export function matchesMemberQuery(
  profile: Record<string, any> | null | undefined,
  term: string,
  extraValues: (string | null | undefined)[] = [],
) {
  const q = term.toLowerCase().trim();
  if (!q) return true;
  if (!profile) return false;

  const values = [
    ...MEMBER_SEARCH_FIELDS.map((f) => profile[f]),
    ...extraValues,
  ];
  if (values.some((v) => v && String(v).toLowerCase().includes(q))) return true;

  const qDigits = digitsOnly(q);
  if (qDigits.length >= 2) {
    const phone = digitsOnly(String(profile.phone_number || ""));
    if (phone && phone.includes(qDigits)) return true;
  }
  return false;
}
