import { NAV_ITEMS } from "@/config/navigation";
import { NavLink } from "./nav-link";
import { VersionStamp } from "./version-stamp";

/**
 * Tab-Leiste am unteren Rand des Rahmens. Sitzt als letztes Flex-Kind (shrink-0) unter dem
 * Inhaltsbereich statt per position:fixed, überdeckt also nie Inhalte oder Buttons.
 */
export function BottomNav() {
  return (
    <nav
      aria-label="Hauptnavigation"
      className="shrink-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <li key={href} className="min-w-0">
            {/* Icon wird hier (Server) gerendert und als Element weitergereicht, nicht als Funktion. */}
            <NavLink href={href} label={label} icon={<Icon aria-hidden className="size-5" />} />
          </li>
        ))}
      </ul>
      <VersionStamp className="pb-1.5" />
    </nav>
  );
}
