import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../lib/utils";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether this chip is the active filter. */
  selected?: boolean;
}

/** Pill-shaped category filter. */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { selected = false, className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-pressed={selected}
      className={cn("jc-chip", selected && "jc-chip--selected", className)}
      {...props}
    />
  );
});
