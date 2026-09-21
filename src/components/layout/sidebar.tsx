import { LogOut, Zap } from "lucide-react";
import { logout } from "@/features/auth/actions";
import { NAV_ITEMS } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { NavLink } from "./nav-link";

/** Desktop-Navigation (ab md). Auf Mobile übernimmt die BottomNav. */
export function Sidebar({ displayName }: { displayName: string }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-white">
          <Zap aria-hidden className="size-4" />
        </span>
        <span className="text-lg font-semibold tracking-tight">PrepPulse</span>
      </div>

      <nav aria-label="Hauptnavigation" className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} layout="sidebar" />
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <p className="truncate px-3 pb-2 text-sm text-muted">{displayName}</p>
        <form action={logout}>
          <Button type="submit" variant="ghost" className="w-full justify-start">
            <LogOut aria-hidden className="size-4" />
            Abmelden
          </Button>
        </form>
      </div>
    </aside>
  );
}
