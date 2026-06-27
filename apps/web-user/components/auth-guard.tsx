"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { USER_ROUTES } from "@vokcg/constants";
import { useAuthStore } from "@/store";

import { LoadingScreen } from "@vokcg/ui";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  // Lazy initialiser: synchronously reads hydration state on every mount
  // (including StrictMode's second mount), avoiding the race where StrictMode
  // cancels the onFinishHydration subscription before the event fires.
  // Optional-chain guards against SSR where persist is not yet initialised.
  const [hydrated, setHydrated] = useState(
    () => useAuthStore.persist?.hasHydrated() ?? false,
  );

  useEffect(() => {
    if (useAuthStore.persist?.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist?.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && !accessToken) {
      router.replace(USER_ROUTES.login);
    }
  }, [accessToken, hydrated, router]);

  if (!hydrated || !accessToken) return <LoadingScreen />;

  return children;
}
