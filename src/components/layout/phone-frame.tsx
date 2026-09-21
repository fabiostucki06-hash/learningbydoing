/**
 * App-Shell: auf Mobile Vollbild, ab md ein zentrierter Handy-Rahmen (max-w-md).
 * Der Rahmen füllt genau den Viewport (h-dvh) und scrollt nie selbst; gescrollt wird nur der
 * Inhaltsbereich darin. So kann nichts hinter die Navigation rutschen.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-background md:my-4 md:h-[calc(100dvh-2rem)] md:rounded-[2rem] md:border md:border-border md:shadow-2xl">
      {/* Zone unter der Statusleiste (Notch/Uhr), nur auf Geräten mit Safe-Area sichtbar. */}
      <div aria-hidden className="h-[env(safe-area-inset-top)] shrink-0 bg-statusbar" />
      {children}
    </div>
  );
}
