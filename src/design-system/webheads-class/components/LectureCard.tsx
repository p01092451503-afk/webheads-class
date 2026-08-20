import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Avatar } from "./Avatar";
import { ProgressBar } from "./ProgressBar";

export interface LectureCardProps extends HTMLAttributes<HTMLElement> {
  /** Thumbnail image URL shown at the top of the card. */
  image: string;
  /** Accessible description of the thumbnail; falls back to the title. */
  imageAlt?: string;
  /** Lecture title. */
  title: string;
  /** Instructor display name. */
  instructor: string;
  /** Optional instructor avatar image URL. */
  instructorAvatar?: string;
  /** Average rating, 0–5. */
  rating: number;
  /** Number of ratings behind the average; shown in parentheses. */
  ratingCount?: number;
  /** Completion percentage, 0–100. Omit to hide the progress bar. */
  progress?: number;
  /** Optional corner badge (NEW, HOT, etc.) overlaid on the thumbnail. */
  badge?: ReactNode;
  /** Destination when the card is used for navigation. Renders an `<a>` when set. */
  href?: string;
}

/** Content card for a single course: thumbnail, title, instructor, rating and progress. */
export const LectureCard = forwardRef<HTMLElement, LectureCardProps>(function LectureCard(
  {
    image,
    imageAlt,
    title,
    instructor,
    instructorAvatar,
    rating,
    ratingCount,
    progress,
    badge,
    href,
    className,
    ...props
  },
  ref,
) {
  const Tag = href ? "a" : ("article" as const);
  const safeRating = Math.min(5, Math.max(0, rating));
  const hasProgress = typeof progress === "number";

  return (
    <Tag
      ref={ref as never}
      {...(href ? { href } : {})}
      className={cn("jc-lecture", className)}
      {...props}
    >
      <div className="jc-lecture__media">
        <img className="jc-lecture__img" src={image} alt={imageAlt ?? title} loading="lazy" />
        {badge ? <span className="jc-lecture__badge">{badge}</span> : null}
        {hasProgress ? (
          <span className="jc-lecture__progress-label">{Math.round(progress!)}%</span>
        ) : null}
      </div>

      <div className="jc-lecture__body">
        <h4 className="jc-lecture__title">{title}</h4>

        <div className="jc-lecture__instructor">
          <Avatar name={instructor} src={instructorAvatar} size="sm" />
          <span className="jc-lecture__instructor-name">{instructor}</span>
        </div>

        <div className="jc-lecture__rating" aria-label={`평점 ${safeRating.toFixed(1)}점`}>
          <svg className="jc-lecture__star" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.5l2.9 6.06 6.6.7-4.9 4.5 1.4 6.54L12 17.9l-5.5 2.4 1.4-6.54-4.9-4.5 6.6-.7z" />
          </svg>
          <span className="jc-lecture__rating-value">{safeRating.toFixed(1)}</span>
          {typeof ratingCount === "number" ? (
            <span className="jc-lecture__rating-count">({ratingCount.toLocaleString()})</span>
          ) : null}
        </div>

        {hasProgress ? (
          <ProgressBar value={progress!} label="진행률" showValue={false} tone="navy" />
        ) : null}
      </div>
    </Tag>
  );
});
