import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Users, Search, Building2, Lock, UserPlus, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBranchAdmin } from "@/hooks/useBranchAdmin";
import { supabase } from "@/integrations/supabase/client";
import { matchesMemberQuery, MEMBER_SEARCH_PLACEHOLDER } from "@/lib/memberSearch";
import { toast } from "@/hooks/use-toast";

const UNASSIGNED = "__unassigned__";

const BranchAdminStaff = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const qc = useQueryClient();
  const { branches, branchIds, hasCapability, isLoading: loadingBA } = useBranchAdmin();
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");

  const canManage = branchIds.some((bid) => hasCapability("staff_manage", bid)) || branchIds.some((bid) => hasCapability("stats_view", bid));
  const canCreate = branchIds.some((bid) => hasCapability("staff_manage", bid));

  // Add-member dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", phoneNumber: "", role: "student", departmentId: "",
  });

  // Assign-branch dialog state
  const [assignTarget, setAssignTarget] = useState<{ user_id: string; full_name: string | null } | null>(null);
  const [assignDeptId, setAssignDeptId] = useState("");

  const { data: depts = [] } = useQuery({
    queryKey: ["branch-admin-staff-depts", branchIds],
    enabled: branchIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name, name_en, parent_department_id, code")
        .or(`id.in.(${branchIds.join(",")}),parent_department_id.in.(${branchIds.join(",")})`);
      if (error) throw error;
      return data ?? [];
    },
  });

  const allDeptIds = useMemo(() => depts.map((d) => d.id), [depts]);

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["branch-admin-staff", allDeptIds, branchFilter],
    enabled: allDeptIds.length > 0 || branchFilter === UNASSIGNED,
    queryFn: async () => {
      const base = "user_id, full_name, email, position, department_id, employee_id, phone_number";

      if (branchFilter === UNASSIGNED) {
        const { data, error } = await supabase
          .from("profiles")
          .select(base)
          .is("department_id", null)
          .order("full_name");
        if (error) throw error;
        return data ?? [];
      }

      let activeDeptIds = allDeptIds;
      if (branchFilter !== "all") {
        activeDeptIds = depts
          .filter((d) => d.id === branchFilter || d.parent_department_id === branchFilter)
          .map((d) => d.id);
      }
      if (activeDeptIds.length === 0) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select(base)
        .in("department_id", activeDeptIds)
        .order("full_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Count of unassigned members so the admin notices them even on "all"
  const { data: unassignedCount = 0 } = useQuery({
    queryKey: ["branch-admin-unassigned-count"],
    enabled: canManage,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("user_id", { count: "exact", head: true })
        .is("department_id", null);
      if (error) return 0;
      return count ?? 0;
    },
  });

  const filtered = useMemo(() => {
    if (!search) return staff;
    const s = search.toLowerCase();
    return staff.filter((p) => matchesMemberQuery(p, s));
  }, [staff, search]);

  const deptName = (id?: string | null) => {
    if (!id) return t("branchAdminStaff.unassigned", "지점 미배정");
    const d = depts.find((x) => x.id === id);
    if (!d) return "-";
    return isEn ? d.name_en || d.name : d.name;
  };

  const handleCreate = async () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim() || !form.departmentId) {
      toast({ title: "이름·이메일·비밀번호·지점을 모두 입력해 주세요.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
          role: form.role,
          departmentId: form.departmentId,
          phoneNumber: form.phoneNumber.trim() || undefined,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({ title: "회원이 등록되었습니다." });
      setAddOpen(false);
      setForm({ fullName: "", email: "", password: "", phoneNumber: "", role: "student", departmentId: "" });
      qc.invalidateQueries({ queryKey: ["branch-admin-staff"] });
      qc.invalidateQueries({ queryKey: ["branch-admin-unassigned-count"] });
    } catch (e: any) {
      toast({ title: "등록 실패", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!assignTarget || !assignDeptId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ department_id: assignDeptId })
        .eq("user_id", assignTarget.user_id);
      if (error) throw error;
      toast({ title: "지점이 배정되었습니다." });
      setAssignTarget(null);
      setAssignDeptId("");
      qc.invalidateQueries({ queryKey: ["branch-admin-staff"] });
      qc.invalidateQueries({ queryKey: ["branch-admin-unassigned-count"] });
    } catch (e: any) {
      toast({ title: "배정 실패", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loadingBA) {
    return (
      <DashboardLayout role="branch_admin">
        <div className="p-6 text-muted-foreground">{t("common.loading", "불러오는 중...")}</div>
      </DashboardLayout>
    );
  }

  if (!canManage) {
    return (
      <DashboardLayout role="branch_admin">
        <div className="p-6 text-center text-muted-foreground">
          <Lock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          {t("branchAdmin.noStaffPerm", "회원 관리 권한이 없습니다. 본사 관리자에게 문의해주세요.")}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="branch_admin">
      <div className="min-w-0 space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-semibold">
              <Users className="h-6 w-6 text-primary" />
              {t("nav.branchAdminStaff", "지점 회원 관리")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("branchAdminStaff.subtitle", "담당 지점에 소속된 회원 목록입니다.")}
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setAddOpen(true)} className="whitespace-nowrap">
              <UserPlus className="h-4 w-4 mr-2" />
              회원 추가
            </Button>
          )}
        </div>

        {unassignedCount > 0 && branchFilter !== UNASSIGNED && (
          <button
            onClick={() => setBranchFilter(UNASSIGNED)}
            className="w-full text-left rounded-lg border-2 border-dashed border-border/80 p-3 text-sm hover:bg-muted/30 transition-colors"
          >
            지점이 배정되지 않은 회원이 <strong>{unassignedCount}</strong>명 있습니다. 클릭하면 목록을 확인하고 지점을 배정할 수 있습니다.
          </button>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("branchAdminStaff.searchPh", MEMBER_SEARCH_PLACEHOLDER)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("branchAdminStaff.allBranches", "전체 지점")}</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {isEn ? b.name_en || b.name : b.name}
                </SelectItem>
              ))}
              <SelectItem value={UNASSIGNED}>지점 미배정</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="self-start sm:self-center whitespace-nowrap">
            {filtered.length}
          </Badge>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground">{t("common.loading", "불러오는 중...")}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 border-2 border-dashed border-border/60 rounded-lg">
            {t("branchAdminStaff.empty", "회원이 없습니다")}
          </div>
        ) : (
          <div className="border-2 border-border/80 rounded-lg overflow-hidden">
            {filtered.map((p) => (
              <div key={p.user_id} className="p-4 border-b-2 border-border/80 last:border-b-0 hover:bg-muted/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{p.full_name || "-"}</span>
                      {p.position && <Badge variant="outline" className="text-[10px]">{p.position}</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {p.email}
                      {p.phone_number ? ` · ${p.phone_number}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      {deptName(p.department_id)}
                    </div>
                    {!p.department_id && canCreate && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAssignTarget({ user_id: p.user_id, full_name: p.full_name });
                          setAssignDeptId("");
                        }}
                      >
                        지점 배정
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add member */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>지점 회원 추가</DialogTitle>
            <DialogDescription>등록한 회원은 선택한 지점 소속으로 즉시 조회됩니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>이름 *</Label>
              <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>이메일 *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>임시 비밀번호 *</Label>
              <Input type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>휴대폰번호</Label>
              <Input value={form.phoneNumber} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>지점 *</Label>
              <Select value={form.departmentId} onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}>
                <SelectTrigger><SelectValue placeholder="지점을 선택하세요" /></SelectTrigger>
                <SelectContent>
                  {depts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{isEn ? d.name_en || d.name : d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>역할</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">학습자</SelectItem>
                  <SelectItem value="teacher">강사</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>취소</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign branch */}
      <Dialog open={!!assignTarget} onOpenChange={(o) => !o && setAssignTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>지점 배정</DialogTitle>
            <DialogDescription>{assignTarget?.full_name || "회원"} 님을 배정할 지점을 선택하세요.</DialogDescription>
          </DialogHeader>
          <Select value={assignDeptId} onValueChange={setAssignDeptId}>
            <SelectTrigger><SelectValue placeholder="지점을 선택하세요" /></SelectTrigger>
            <SelectContent>
              {depts.map((d) => (
                <SelectItem key={d.id} value={d.id}>{isEn ? d.name_en || d.name : d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTarget(null)}>취소</Button>
            <Button onClick={handleAssign} disabled={saving || !assignDeptId}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}배정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BranchAdminStaff;
