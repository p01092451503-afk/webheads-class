import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "../lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible field label; always provide one for accessibility. */
  label?: string;
  /** Helper text shown under the control. */
  hint?: string;
  /** Error message; also switches the control to the invalid style. */
  error?: string;
}

/** Multi-line text field for posts, answers and comments. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, id, ...props },
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
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn("jc-control", "jc-control--textarea", error && "jc-control--invalid", className)}
        {...props}
      />
      {message ? (
        <span className={cn("jc-field__hint", error && "jc-field__hint--error")}>{message}</span>
      ) : null}
    </div>
  );
});
