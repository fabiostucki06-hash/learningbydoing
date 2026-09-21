"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/navigation";

type Props = {
  item: NavItem;
  /** "sidebar": Icon + Label nebeneinander, "bottom": untereinander (Mobile). */
  layout: "sidebar" | "bottom";
};

export function NavLink({ item, layout }: Props) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  const base =
    layout === "sidebar"
      ? "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium"
      : "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium";

  const content = (
    <>
      <Icon aria-hidden className="size-5 shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.soon && layout === "sidebar" && (
        <span className="ml-auto rounded-full bg-surface-hover px-2 py-0.5 text-[10px] uppercase tracking-wide">
          bald
        </span>
      )}
    </>
  );

  if (item.soon) {
    return (
      <span aria-disabled="true" className={`${base} cursor-not-allowed text-muted opacity-60`}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`${base} transition-colors ${
        active
          ? "bg-brand/10 text-brand"
          : "text-muted hover:bg-surface-hover hover:text-foreground"
      }`}
    >
      {content}
    </Link>
  );
}
