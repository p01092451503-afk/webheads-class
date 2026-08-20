import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export interface TabItem {
  /** Stable identifier returned by onChange. */
  id: string;
  /** Visible tab label. */
  label: ReactNode;
  /** Optional count pill rendered next to the label. */
  count?: number;
}

export interface TabsProps {
  /** Tabs to render, in order. */
  items: TabItem[];
  /** Id of the currently selected tab. */
  value: string;
  /** Called with the id of the tab the user selected. */
  onChange: (id: string) => void;
  className?: string;
}

/** Underlined tab bar used across list pages. */
export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div role="tablist" className={cn("jc-tabs", className)}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn("jc-tab", active && "jc-tab--active")}
            onClick={() => onChange(item.id)}
          >
            {item.label}
            {typeof item.count === "number" ? (
              <span className="jc-tab__count">{item.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
