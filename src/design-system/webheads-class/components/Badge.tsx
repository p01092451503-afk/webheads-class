import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../lib/utils";

export type BadgeTone = "neutral" | "success" | "info" | "warning" | "danger" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic colour of the badge. */
  tone?: BadgeTone;
}

/** Compact status pill for course state, notice flags and list metadata. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = "neutral", className, ...props },
  ref,
) {
  return <span ref={ref} className={cn("jc-badge", `jc-badge--${tone}`, className)} {...props} />;
});
