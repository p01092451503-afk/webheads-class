import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { JC_THEMES, JC_THEME_LABELS, useTheme, type JcTheme } from "../lib/theme";

export interface ThemeSwitchProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled theme value. Omit to let the switch manage the document theme itself. */
  value?: JcTheme;
  /** Called with the newly selected theme. */
  onChange?: (theme: JcTheme) => void;
  /** Subset / ordering of themes to offer. */
  themes?: readonly JcTheme[];
  /** Accessible label for the group. */
  label?: string;
}

/** Segmented control that switches the palette variant (light / dark / high contrast). */
export const ThemeSwitch = forwardRef<HTMLDivElement, ThemeSwitchProps>(function ThemeSwitch(
  { value, onChange, themes = JC_THEMES, label = "테마 선택", className, ...props },
  ref,
) {
  const managed = useTheme();
  const current = value ?? managed.theme;

  return (
    <div ref={ref} role="group" aria-label={label} className={cn("jc-theme-switch", className)} {...props}>
      {themes.map((theme) => (
        <button
          key={theme}
          type="button"
          aria-pressed={current === theme}
          className={cn("jc-theme-switch__option", current === theme && "jc-theme-switch__option--active")}
          onClick={() => {
            if (value === undefined) managed.setTheme(theme);
            onChange?.(theme);
          }}
        >
          {JC_THEME_LABELS[theme]}
        </button>
      ))}
    </div>
  );
});
