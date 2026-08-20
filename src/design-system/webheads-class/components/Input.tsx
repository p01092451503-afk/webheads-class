import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "../lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible field label; always provide one for accessibility. */
  label?: string;
  /** Helper text shown under the control. */
  hint?: string;
  /** Error message; also switches the control to the invalid style. */
  error?: string;
}

/** Single-line text field. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const message = error ?? hint;

  return (
    <div className="jc-field">
      {label ? (
        <label className="jc-field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn("jc-control", error && "jc-control--invalid", className)}
        {...props}
      />
      {message ? (
        <span className={cn("jc-field__hint", error && "jc-field__hint--error")}>{message}</span>
      ) : null}
    </div>
  );
});
