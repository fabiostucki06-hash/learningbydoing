import { NAV_ITEMS } from "@/config/navigation";
import { NavLink } from "./nav-link";

/** Mobile-Navigation (unter md), fix am unteren Rand. */
export function BottomNav() {
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV_ITEMS.slice(0, 5).map((item) => (
        <NavLink key={item.href} item={item} layout="bottom" />
      ))}
    </nav>
  );
}
