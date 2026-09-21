"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/navigation";

export function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`pressable flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-medium ${
        active ? "text-brand" : "text-muted"
      }`}
    >
      <span
        className={`flex h-7 w-14 items-center justify-center rounded-full transition-colors ${
          active ? "bg-brand/15" : ""
        }`}
      >
        <Icon aria-hidden className="size-5" strokeWidth={active ? 2.5 : 2} />
      </span>
      <span className="max-w-full truncate">{item.label}</span>
    </Link>
  );
}
