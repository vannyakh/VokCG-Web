"use client";

import { useEffect, useState } from "react";

import { useAdminAuthStore } from "@/store";

/** Wait for persisted auth store before running guard redirects. */
export function useAdminAuthHydration() {
  const accessToken = useAdminAuthStore((s) => s.accessToken);

  // Lazy initialiser: reads the synchronous hydration state immediately on
  // every mount (including StrictMode's second mount), so we never rely on
  // the subscription alone. If the store is already hydrated the guard renders
  // without waiting for the effect — no flash, no race.
  // Optional-chain guards against SSR where persist is not yet initialised.
  const [hydrated, setHydrated] = useState(
    () => useAdminAuthStore.persist?.hasHydrated() ?? false,
  );

  useEffect(() => {
    if (useAdminAuthStore.persist?.hasHydrated()) {
      setHydrated(true);
      return;
    }
    // Store not yet hydrated — subscribe so we catch the event.
    const unsub = useAdminAuthStore.persist?.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  return { accessToken, hydrated, isReady: hydrated };
}
