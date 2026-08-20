import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { cn } from "../lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Visible field label; always provide one for accessibility. */
  label?: string;
  /** Helper text shown under the control. */
  hint?: string;
  /** Error message; also switches the control to the invalid style. */
  error?: string;
}

/** Native select styled to match the system's text fields. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, id, children, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const message = error ?? hint;

  return (
    <div className="jc-field">
      {label ? (
        <label className="jc-field__label" htmlFor={fieldId}>
          {label}
        </label>
      ) : null}
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn("jc-control", "jc-control--select", error && "jc-control--invalid", className)}
        {...props}
      >
        {children}
      </select>
      {message ? (
        <span className={cn("jc-field__hint", error && "jc-field__hint--error")}>{message}</span>
      ) : null}
    </div>
  );
});
