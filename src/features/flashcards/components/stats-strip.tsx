import { CheckCheck, Flame, Target, type LucideIcon } from "lucide-react";

type Props = {
  streak: number;
  reviewedToday: number;
  /** Trefferquote heute in Prozent, null wenn heute noch nichts bewertet wurde. */
  accuracyToday: number | null;
};

function Tile({ icon: Icon, value, label, accent }: {
  icon: LucideIcon;
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <li className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface px-2 py-3 text-center shadow-sm">
      <Icon
        aria-hidden
        className={`size-5 ${accent ? "text-orange-500" : "text-brand"}`}
      />
      <span className="text-lg font-semibold leading-none">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </li>
  );
}

/** Streak, heutige Karten und Trefferquote. */
export function StatsStrip({ streak, reviewedToday, accuracyToday }: Props) {
  return (
    <ul className="grid grid-cols-3 gap-3" aria-label="Lernstatistik">
      <Tile
        icon={Flame}
        value={String(streak)}
        label={streak === 1 ? "Tag Streak" : "Tage Streak"}
        accent={streak > 0}
      />
      <Tile icon={CheckCheck} value={String(reviewedToday)} label="Heute gelernt" />
      <Tile
        icon={Target}
        value={accuracyToday === null ? "–" : `${accuracyToday} %`}
        label="Trefferquote"
      />
    </ul>
  );
}
