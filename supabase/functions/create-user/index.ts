import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization")!;

    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return json({ error: "Unauthorized" }, 401);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const isAdmin = callerRoles?.some((r) => r.role === "admin" || r.role === "super_admin");
    const isBranchAdmin = callerRoles?.some((r) => r.role === "branch_admin");

    const body = await req.json();
    const {
      email,
      password,
      fullName,
      role,
      departmentId,
      phoneNumber,
      birthDate,
      gender,
      memberStatus,
      gradeId,
      marketingEmail,
      marketingSms,
      marketingKakao,
    } = body ?? {};

    // Branch admins may only create members inside a branch they manage,
    // and only with the "student" or "teacher" role.
    if (!isAdmin) {
      if (!isBranchAdmin) return json({ error: "Admin access required" }, 403);

      const { data: allowedBranches } = await adminClient.rpc(
        "get_user_branch_admin_branches",
        { _user_id: caller.id },
      );
      const branchIds: string[] = allowedBranches ?? [];

      const { data: canManage } = await adminClient.rpc(
        "user_has_any_branch_capability",
        { _user_id: caller.id, _capability: "staff_manage" },
      );
      if (!canManage) return json({ error: "Staff management permission required" }, 403);

      if (!departmentId) return json({ error: "departmentId is required" }, 400);

      // departmentId must be one of the managed branches or a child of one.
      const { data: dept } = await adminClient
        .from("departments")
        .select("id, parent_department_id")
        .eq("id", departmentId)
        .maybeSingle();

      const allowed = dept &&
        (branchIds.includes(dept.id) ||
          (dept.parent_department_id && branchIds.includes(dept.parent_department_id)));
      if (!allowed) return json({ error: "Department outside your branch scope" }, 403);

      if (role && !["student", "teacher"].includes(role)) {
        return json({ error: "Branch admins can only create students or teachers" }, 403);
      }
    }

    if (!email || !password) {
      return json({ error: "Email and password are required" }, 400);
    }

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, department_id: departmentId },
    });

    if (createError) return json({ error: createError.message }, 400);
    const userId = newUser.user?.id;

    if (role && role !== "student" && userId) {
      await adminClient.from("user_roles").delete().eq("user_id", userId);
      await adminClient.from("user_roles").insert({ user_id: userId, role });
    }

    if (userId) {
      const profileUpdate: Record<string, unknown> = {};
      if (departmentId) profileUpdate.department_id = departmentId;
      if (phoneNumber) profileUpdate.phone_number = phoneNumber;
      if (birthDate) profileUpdate.birth_date = birthDate;
      if (gender) profileUpdate.gender = gender;
      if (memberStatus) profileUpdate.member_status = memberStatus;
      if (gradeId) profileUpdate.grade_id = gradeId;
      if (typeof marketingEmail === "boolean") profileUpdate.marketing_email = marketingEmail;
      if (typeof marketingSms === "boolean") profileUpdate.marketing_sms = marketingSms;
      if (typeof marketingKakao === "boolean") profileUpdate.marketing_kakao = marketingKakao;
      if (marketingEmail || marketingSms || marketingKakao) {
        profileUpdate.marketing_agreed_at = new Date().toISOString();
      }
      if (Object.keys(profileUpdate).length > 0) {
        await adminClient.from("profiles").update(profileUpdate).eq("user_id", userId);
      }
    }

    return json({ user: newUser.user });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ error: message }, 500);
  }
});
