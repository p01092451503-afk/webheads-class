import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";

export type CardVariant = "raised" | "soft" | "flat";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Elevation treatment. */
  variant?: CardVariant;
}

/** White rounded surface used for every content section. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "raised", className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("jc-card", variant !== "raised" && `jc-card--${variant}`, className)}
      {...props}
    />
  );
});

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Section title text. */
  title: ReactNode;
  /** Optional trailing action (link, button, filter). */
  action?: ReactNode;
}

/** Title row for a Card, with an optional trailing action. */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { title, action, className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn("jc-card__head", className)} {...props}>
      <h3 className="jc-card__title">{title}</h3>
      {action}
    </div>
  );
});

export type CardBodyProps = HTMLAttributes<HTMLDivElement>;

/** Padded content region of a Card. */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(function CardBody(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("jc-card__body", className)} {...props} />;
});
