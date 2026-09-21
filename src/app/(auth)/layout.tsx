import { Zap } from "lucide-react";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { VersionStamp } from "@/components/layout/version-stamp";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PhoneFrame>
      <main className="scrollbar-none flex flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-8">
        {/* my-auto statt justify-center: zentriert, schneidet aber bei hoher Tastatur nichts ab. */}
        <div className="my-auto w-full">
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
              <Zap aria-hidden className="size-7" />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">learningbydoing</h1>
            <p className="text-sm text-muted">Lernen, das im Takt bleibt.</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            {children}
          </div>
          <VersionStamp className="mt-6" />
        </div>
      </main>
    </PhoneFrame>
  );
}
