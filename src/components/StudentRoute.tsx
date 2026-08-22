import { Navigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useUserRole } from "@/hooks/useUserRole";
import { FullScreenSkeleton } from "@/components/PageSkeletons";
import ProtectedRoute from "@/components/ProtectedRoute";

/**
 * 학습자 전용 화면 가드.
 * - 로그인 필수
 * - 학습자(student) 역할 보유자만 진입. 강사/관리자는 점검 목적으로 허용.
 * - 역할이 하나도 없는 계정(가입 직후 등)은 대시보드로 되돌려 보냄.
 */
const StudentRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useUser();
  const { isStudent, isTeacher, isAdmin } = useUserRole();

  if (isLoading) return <FullScreenSkeleton />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isStudent && !isTeacher && !isAdmin) return <Navigate to="/dashboard" replace />;

  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export default StudentRoute;
