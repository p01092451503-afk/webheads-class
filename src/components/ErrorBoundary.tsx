import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

/**
 * 전역 에러 바운더리 — 렌더링 오류 시 흰 화면 대신 복구 UI를 노출한다.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  private handleReload = () => {
    this.setState({ hasError: false, message: undefined });
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="text-xl font-semibold text-foreground">화면을 표시하지 못했습니다</h1>
          <p className="text-sm text-muted-foreground">
            일시적인 오류가 발생했습니다. 새로고침하거나 홈으로 이동해 주세요.
          </p>
          {this.state.message && (
            <p className="text-xs text-muted-foreground/80 break-words border border-border rounded-md p-3 text-left">
              {this.state.message}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={this.handleReload}
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
            >
              새로고침
            </button>
            <button
              onClick={this.handleHome}
              className="px-4 py-2 rounded-full border border-border text-sm font-medium text-foreground"
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
