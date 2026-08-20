import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../lib/utils";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Image URL; when omitted the initials fallback is shown. */
  src?: string;
  /** Accessible name of the person, also used for the initials fallback. */
  name: string;
  /** Avatar diameter. */
  size?: AvatarSize;
}

/** Circular user image with an initials fallback. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, name, size = "md", className, ...props },
  ref,
) {
  return (
    <span ref={ref} className={cn("jc-avatar", `jc-avatar--${size}`, className)} {...props}>
      {src ? <img src={src} alt={name} /> : <span aria-hidden="true">{name.slice(0, 1)}</span>}
      {src ? null : <span className="jc-sr-only">{name}</span>}
    </span>
  );
});
