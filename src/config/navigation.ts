import {
  CalendarClock,
  FileText,
  GraduationCap,
  Home,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Untere Tab-Leiste. Maximal 5 Einträge, damit jedes Ziel ≥ 44 px breit bleibt. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Start", icon: Home },
  { href: "/documents", label: "Dokumente", icon: FileText },
  { href: "/exams", label: "Prüfungen", icon: CalendarClock },
  { href: "/practice", label: "Üben", icon: GraduationCap },
  { href: "/profile", label: "Profil", icon: User },
];
