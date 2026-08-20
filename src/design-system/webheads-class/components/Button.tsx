import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../lib/utils";

export type ButtonVariant = "primary" | "accent" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `primary` is the default navy action. */
  variant?: ButtonVariant;
  /** Control height / text scale. */
  size?: ButtonSize;
  /** Stretch to the full width of the parent. */
  block?: boolean;
}

/** Primary action control of the J CAMPUS system. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", block = false, className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "jc-btn",
        `jc-btn--${variant}`,
        `jc-btn--${size}`,
        block && "jc-btn--block",
        className,
      )}
      {...props}
    />
  );
});
