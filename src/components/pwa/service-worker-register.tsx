"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000;

/**
 * Registriert den Service Worker (nur in Production, damit er Dev-Builds nicht beeinflusst) und
 * sorgt dafür, dass neue Deployments zügig ankommen:
 * - Update-Check bei jedem Öffnen/Zurückkehren in die App und alle 30 Minuten.
 * - Der neue Worker übernimmt sofort (skipWaiting + clients.claim). Danach läuft die Seite noch mit
 *   altem JS: im Hintergrund laden wir automatisch neu, sonst zeigen wir einen Aktualisieren-Hinweis
 *   (kein Reload mitten in einem Upload oder Formular).
 */
export function ServiceWorkerRegister() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    // Beim allerersten Besuch gibt es keinen Controller: dann ist controllerchange nur die
    // Erstinstallation und kein Update.
    const hadController = Boolean(navigator.serviceWorker.controller);
    let registration: ServiceWorkerRegistration | undefined;
    let reloading = false;

    const checkForUpdate = () => {
      registration?.update().catch(() => {});
    };

    function onControllerChange() {
      if (!hadController || reloading) return;
      if (document.visibilityState === "hidden") {
        reloading = true;
        window.location.reload();
        return;
      }
      setUpdateReady(true);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") checkForUpdate();
    }

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const interval = window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        registration = reg;
      })
      .catch((error) => console.error("Service-Worker-Registrierung fehlgeschlagen:", error));

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(interval);
    };
  }, []);

  if (!updateReady) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md px-4">
      <div
        role="status"
        className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 pl-4 shadow-lg"
      >
        <p className="min-w-0 flex-1 text-sm font-medium">Neue Version verfügbar</p>
        <Button onClick={() => window.location.reload()} className="h-11 shrink-0">
          <RefreshCw aria-hidden className="size-4" />
          Aktualisieren
        </Button>
      </div>
    </div>
  );
}
