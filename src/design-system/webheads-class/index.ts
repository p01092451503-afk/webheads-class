import "./styles/theme.css";

export { Button } from "./components/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./components/Button";

export { Heading } from "./components/Heading";
export type { HeadingProps, HeadingLevel, HeadingSize } from "./components/Heading";

export { Badge } from "./components/Badge";
export type { BadgeProps, BadgeTone } from "./components/Badge";

export { Card, CardHeader, CardBody } from "./components/Card";
export type { CardProps, CardVariant, CardHeaderProps, CardBodyProps } from "./components/Card";

export { Input } from "./components/Input";
export type { InputProps } from "./components/Input";

export { Textarea } from "./components/Textarea";
export type { TextareaProps } from "./components/Textarea";

export { Select } from "./components/Select";
export type { SelectProps } from "./components/Select";

export { Tabs } from "./components/Tabs";
export type { TabsProps, TabItem } from "./components/Tabs";

export { Chip } from "./components/Chip";
export type { ChipProps } from "./components/Chip";

export { Pagination } from "./components/Pagination";
export type { PaginationProps } from "./components/Pagination";

export { Avatar } from "./components/Avatar";
export type { AvatarProps, AvatarSize } from "./components/Avatar";

export { ProgressBar } from "./components/ProgressBar";
export type { ProgressBarProps, ProgressTone } from "./components/ProgressBar";

export { LectureCard } from "./components/LectureCard";
export type { LectureCardProps } from "./components/LectureCard";

export { PageHeader } from "./components/PageHeader";
export type { PageHeaderProps } from "./components/PageHeader";

export { AnnouncementList, ANNOUNCEMENT_ALL_CATEGORIES } from "./components/AnnouncementList";
export type { AnnouncementListProps, AnnouncementItem } from "./components/AnnouncementList";

export { AnnouncementDetail } from "./components/AnnouncementDetail";
export type { AnnouncementDetailProps, AnnouncementAction } from "./components/AnnouncementDetail";

export { cn } from "./lib/utils";

export { DashboardLayout, DashboardNavGroup, DashboardNavItem } from "./components/DashboardLayout";
export type {
  DashboardLayoutProps,
  DashboardNavGroupProps,
  DashboardNavItemProps,
} from "./components/DashboardLayout";

export { ThemeSwitch } from "./components/ThemeSwitch";
export type { ThemeSwitchProps } from "./components/ThemeSwitch";

export { useTheme, applyTheme, JC_THEMES, JC_THEME_LABELS } from "./lib/theme";
export type { JcTheme } from "./lib/theme";
