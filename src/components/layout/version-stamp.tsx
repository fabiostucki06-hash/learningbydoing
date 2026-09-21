const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION;
const COMMIT_SHA = process.env.NEXT_PUBLIC_COMMIT_SHA;
const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME;

function formatBuildTime(iso: string | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("de-CH", {
    timeZone: "Europe/Zurich",
    dateStyle: "short",
    timeStyle: "short",
  });
}

/** Dezenter Build-Stempel: "v0.1.0 • Stand 21.09.2026, 15:32 • 508790b". Werte kommen aus next.config.ts. */
export function VersionStamp({ className = "" }: { className?: string }) {
  const built = formatBuildTime(BUILD_TIME);

  return (
    <p className={`text-center text-[10px] leading-4 text-muted/80 ${className}`}>
      v{APP_VERSION}
      {built && <> • Stand {built}</>}
      {COMMIT_SHA && <> • {COMMIT_SHA}</>}
    </p>
  );
}
