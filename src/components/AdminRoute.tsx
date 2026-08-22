import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/contexts/UserContext";
import { useUserRole } from "@/hooks/useUserRole";
import { FullScreenSkeleton } from "@/components/PageSkeletons";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading } = useUser();
  const { isAdmin, roles } = useUserRole();
  const isSuperAdmin = roles.includes("super_admin");
  const { i18n } = useTranslation();

  // Admin/Super Admin operators are Korean — force KO inside admin area
  // regardless of any saved language preference or browser detection.
  useEffect(() => {
    if (!user) return;
    if (!(isAdmin || isSuperAdmin)) return;
    if (!i18n.language?.toLowerCase().startsWith("ko")) {
      i18n.changeLanguage("ko");
    }
  }, [user, isAdmin, isSuperAdmin, i18n, i18n.language]);

  if (isLoading) return <FullScreenSkeleton />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin && !isSuperAdmin) return <Navigate to="/dashboard" replace />;

  // Role switcher 활성 역할이 admin이 아닌 경우(student/teacher 모드로 전환)
  // admin 권한이 있더라도 admin 페이지 접근을 차단한다.
  // localStorage 값은 "권한 축소"에만 쓰이는 UI 힌트이므로 위험하지 않다.
  // 단, RoleSwitcher가 제공하는 미리보기 역할(관리자→학습자/강사)과 동일한
  // 집합만 인정해 임의 문자열로 엉뚱한 경로로 튀지 않게 한다.
  const storedRole = (() => {
    try {
      return localStorage.getItem("nf-active-role");
    } catch {
      return null;
    }
  })();
  const switchable = new Set<string>(roles.map((r) => (r === "super_admin" ? "admin" : r)));
  if (switchable.has("admin") || switchable.has("teacher") || switchable.has("branch_admin")) {
    switchable.add("student");
  }
  if (switchable.has("admin")) switchable.add("teacher");
  const activeRole = storedRole && switchable.has(storedRole) ? storedRole : null;
  if (activeRole && activeRole !== "admin") {
    const target =
      activeRole === "teacher" ? "/teacher" : activeRole === "branch_admin" ? "/branch-admin" : "/student";
    return <Navigate to={target} replace />;
  }


  return <>{children}</>;
};

export default AdminRoute;
