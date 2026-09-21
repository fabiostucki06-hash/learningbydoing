"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 60_000;

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, TICK_MS);
  return () => window.clearInterval(id);
}

// Auf die Minute gerundet, damit der Snapshot zwischen Ticks stabil bleibt.
function getSnapshot() {
  return Math.floor(Date.now() / TICK_MS) * TICK_MS;
}

/**
 * Aktuelle Zeit, die jede Minute nachzieht. Beim Server-Render und bei der Hydration gilt
 * serverNow, danach übernimmt die Client-Uhr. So gibt es keinen Hydration-Mismatch.
 */
export function useNow(serverNow: number) {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverNow);
}
