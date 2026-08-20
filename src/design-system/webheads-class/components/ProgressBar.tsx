import { cn } from "../lib/utils";

export type ProgressTone = "navy" | "accent" | "success";

export interface ProgressBarProps {
  /** Completion percentage, 0–100. */
  value: number;
  /** Optional label shown above the track. */
  label?: string;
  /** Show the percentage value next to the label. */
  showValue?: boolean;
  /** Fill colour. */
  tone?: ProgressTone;
  className?: string;
}

/** Course-completion progress indicator. */
export function ProgressBar({
  value,
  label,
  showValue = true,
  tone = "navy",
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("jc-progress", tone !== "navy" && `jc-progress--${tone}`, className)}>
      {label || showValue ? (
        <div className="jc-progress__meta">
          <span>{label}</span>
          {showValue ? <span>{pct}%</span> : null}
        </div>
      ) : null}
      <div
        className="jc-progress__track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="jc-progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
