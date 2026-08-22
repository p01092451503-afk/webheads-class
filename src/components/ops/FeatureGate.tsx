import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PackageOpen } from "lucide-react";
import { useFeatureModules, type FeatureModuleKey } from "@/hooks/useFeatureModules";
import { FullScreenSkeleton } from "@/components/PageSkeletons";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";

interface FeatureGateProps {
  module: FeatureModuleKey;
  children: ReactNode;
  /** true면 비활성 시 안내 화면 표시, false면 아무것도 렌더링하지 않음 */
  redirectIfDisabled?: boolean;
}

/**
 * 기능 모듈 게이트.
 * - 모듈이 비활성화되어 있으면 자식 컴포넌트를 렌더링하지 않습니다.
 * - 라우트 보호용으로 사용 시, 갑작스러운 홈 이동 대신 사유를 설명하는 안내 화면을 보여줍니다.
 */
export default function FeatureGate({
  module,
  children,
  redirectIfDisabled = true,
}: FeatureGateProps) {
  const { isEnabled, isLoading } = useFeatureModules();

  if (isLoading) return <FullScreenSkeleton />;

  if (!isEnabled(module)) {
    if (!redirectIfDisabled) return null;
    return (
      <DashboardLayout>
        <div className="min-w-0 flex flex-col items-center justify-center py-24 text-center">
          <PackageOpen className="h-10 w-10 text-muted-foreground" />
          <h1 className="text-xl sm:text-2xl font-semibold mt-4">사용할 수 없는 기능입니다</h1>
          <p className="text-muted-foreground mt-2 max-w-md">
            이 기능은 현재 관리자에 의해 비활성화되어 있습니다. 이용이 필요하시면 운영 담당자에게 문의해 주세요.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/dashboard">대시보드로 돌아가기</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return <>{children}</>;
}
