"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  label: string;
  /**
   * Fertig gerendertes Icon-Element. Eine Icon-Komponente (Funktion) dürfte ein Server Component
   * nicht an diese Client Component reichen, ein gerendertes Element schon.
   */
  icon: ReactNode;
};

export function NavLink({ href, label, icon }: Props) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`pressable flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-medium aria-[current=page]:[&_svg]:[stroke-width:2.5] ${
        active ? "text-brand" : "text-muted"
      }`}
    >
      <span
        className={`flex h-7 w-14 items-center justify-center rounded-full transition-colors ${
          active ? "bg-brand/15" : ""
        }`}
      >
        {icon}
      </span>
      <span className="max-w-full truncate">{label}</span>
    </Link>
  );
}
