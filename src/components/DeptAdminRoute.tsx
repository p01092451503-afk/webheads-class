import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { FullScreenSkeleton } from "@/components/PageSkeletons";

interface DeptAdminRouteProps {
  children: React.ReactNode;
}

/**
 * 부서(팀) 관리자 전용 가드.
 * - 로그인 필수
 * - user_department_roles 에 dept_admin / team_admin 배정이 있어야 접근 가능
 * - 본사 관리자(admin/super_admin)는 점검 목적으로 접근 허용
 */
const DeptAdminRoute = ({ children }: DeptAdminRouteProps) => {
  const { user, isLoading } = useUser();
  const { isAdmin } = useUserRole();

  const { data: hasDeptRole, isLoading: deptLoading } = useQuery({
    queryKey: ["dept-admin-guard", user?.id],
    enabled: !!user?.id && !isAdmin,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_department_roles")
        .select("id")
        .eq("user_id", user!.id)
        .in("dept_role", ["dept_admin", "team_admin"])
        .limit(1);
      if (error) return false;
      return (data?.length ?? 0) > 0;
    },
  });

  if (isLoading) return <FullScreenSkeleton />;
  if (!user) return <Navigate to="/auth" replace />;
  if (isAdmin) return <>{children}</>;
  if (deptLoading) return <FullScreenSkeleton />;
  if (!hasDeptRole) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default DeptAdminRoute;
