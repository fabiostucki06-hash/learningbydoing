"use client";

import { useEffect } from "react";

/** Registriert den Service Worker (nur in Production, damit er die Dev-Builds nicht cached). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => console.error("Service-Worker-Registrierung fehlgeschlagen:", error));
  }, []);

  return null;
}
