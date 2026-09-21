import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand text-white">
            <Zap aria-hidden className="size-6" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">PrepPulse</h1>
          <p className="text-sm text-muted">Lernen, das im Takt bleibt.</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
