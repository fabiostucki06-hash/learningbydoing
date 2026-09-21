import {
  BookOpen,
  CalendarClock,
  FileText,
  LayoutDashboard,
  Library,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Feature noch nicht gebaut: wird deaktiviert angezeigt statt auf 404 zu verlinken. */
  soon?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Dokumente", icon: FileText, soon: true },
  { href: "/flashcards", label: "Lernkarten", icon: BookOpen, soon: true },
  { href: "/exams", label: "Prüfungen", icon: CalendarClock, soon: true },
  { href: "/past-exams", label: "Altprüfungen", icon: Library, soon: true },
  { href: "/groups", label: "Lerngruppen", icon: Users, soon: true },
];
