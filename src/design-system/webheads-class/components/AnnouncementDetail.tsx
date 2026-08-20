import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Badge, type BadgeTone } from "./Badge";

export interface AnnouncementAction {
  /** Stable key. */
  id: string;
  /** Visible label. */
  label: string;
  /** Optional leading icon node. */
  icon?: ReactNode;
  /** Visual emphasis. Defaults to "secondary". */
  variant?: "primary" | "accent" | "secondary" | "outline" | "ghost";
  /** Invoked on click. */
  onClick?: () => void;
  /** When set, the action renders as an anchor. */
  href?: string;
  /** Marks the action as destructive (delete). */
  destructive?: boolean;
}

export interface AnnouncementDetailProps
  extends Omit<HTMLAttributes<HTMLElement>, "title" | "content"> {
  /** Notice headline (rendered as the page H1). */
  title: ReactNode;
  /** Display date, e.g. "2026.08.20". */
  date: string;
  /** Category label shown in the chip, e.g. "공지". */
  category: string;
  /** Semantic colour of the category chip. Defaults to "neutral". */
  tone?: BadgeTone;
  /** Optional author / publisher line. */
  author?: ReactNode;
  /** Optional view / hit count metadata. */
  views?: ReactNode;
  /** Full notice body. Renders inside the prose region. */
  content: ReactNode;
  /** Optional node rendered above the title, e.g. a back link. */
  back?: ReactNode;
  /** Optional attachment list shown after the content. */
  attachments?: ReactNode;
  /** Footer actions (edit, share, delete…). */
  actions?: ReactNode;
  /** Page label shown above the title, e.g. "공지사항". */
  eyebrow?: ReactNode;
}

/**
 * Page-level view for a single notice: headline, category/date meta,
 * full prose body and an actions row. Composes Badge and the design
 * system's spacing/shadow/typography tokens — no raw values.
 */
export const AnnouncementDetail = forwardRef<HTMLElement, AnnouncementDetailProps>(
  function AnnouncementDetail(
    {
      title,
      date,
      category,
      tone = "neutral",
      author,
      views,
      content,
      back,
      attachments,
      actions,
      eyebrow,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <article ref={ref} className={cn("jc-announcement-detail", className)} {...props}>
        {back ? <div className="jc-announcement-detail__back">{back}</div> : null}

        <header className="jc-announcement-detail__head">
          {eyebrow ? <p className="jc-announcement-detail__eyebrow">{eyebrow}</p> : null}
          <h1 className="jc-announcement-detail__title">{title}</h1>
          <div className="jc-announcement-detail__meta">
            <Badge tone={tone}>{category}</Badge>
            <time className="jc-announcement-detail__date">{date}</time>
            {author ? (
              <span className="jc-announcement-detail__author">
                <span className="jc-announcement-detail__dot" aria-hidden="true" />
                {author}
              </span>
            ) : null}
            {views ? (
              <span className="jc-announcement-detail__views">
                <span className="jc-announcement-detail__dot" aria-hidden="true" />
                {views}
              </span>
            ) : null}
          </div>
        </header>

        <div className="jc-prose">{content}</div>

        {attachments ? (
          <div className="jc-announcement-detail__attachments">{attachments}</div>
        ) : null}

        {actions ? <div className="jc-announcement-detail__actions">{actions}</div> : null}
      </article>
    );
  },
);
