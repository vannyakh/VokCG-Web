"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { USER_ROUTES } from "@vokcg/constants";
import { useAuthStore } from "@/store";

import { LoadingScreen } from "@vokcg/ui";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    setHydrated(useAuthStore.persist.hasHydrated());
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
