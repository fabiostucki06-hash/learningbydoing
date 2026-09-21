/** Fortschrittsbalken. Der Wert steht zusätzlich als Text daneben, Farbe ist nie das einzige Signal. */
export function ProgressBar({ percent, label }: { percent: number; label: string }) {
  const value = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className="h-2 overflow-hidden rounded-full bg-surface-hover"
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
