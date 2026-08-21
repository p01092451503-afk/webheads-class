import { forwardRef, type ReactNode } from "react";
import { cn } from "../lib/utils";

export interface PageHeaderProps {
  /** Page title (renders as the page's H1). */
  title: ReactNode;
  /** Supporting line under the title. */
  subtitle?: ReactNode;
  /** Trailing element such as a date pill or primary action. */
  action?: ReactNode;
  className?: string;
}

/** Standard title block at the top of every LMS page. */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  { title, subtitle, action, className },
  ref,
) {
  return (
    <header ref={ref} className={cn("jc-page-header", className)}>
      <div>
        <h1 className="jc-page-header__title">{title}</h1>
        {subtitle ? <p className="jc-page-header__subtitle">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
});
