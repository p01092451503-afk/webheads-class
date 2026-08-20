import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../lib/utils";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
/** Named steps of the type scale — never pick a raw font-size for a heading. */
export type HeadingSize = "display" | "page" | "section" | "card" | "item" | "eyebrow";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic level of the heading element. Choose by document outline, not by looks. */
  level?: HeadingLevel;
  /** Visual step of the type scale. Defaults to a sensible step for the level. */
  size?: HeadingSize;
}

const defaultSize: Record<HeadingLevel, HeadingSize> = {
  1: "page",
  2: "section",
  3: "card",
  4: "item",
  5: "item",
  6: "eyebrow",
};

/** Heading with the system's fixed size / weight / line-height pairings. */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level = 2, size, className, ...props },
  ref,
) {
  const Tag = `h${level}` as "h1";
  return (
    <Tag
      ref={ref}
      className={cn("jc-heading", `jc-heading--${size ?? defaultSize[level]}`, className)}
      {...props}
    />
  );
});
