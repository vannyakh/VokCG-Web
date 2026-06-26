"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";

import { USER_ROUTES } from "@vokcg/constants";
import { useAuthStore } from "@/store";

import { LoadingScreen } from "@vokcg/ui";

function GuestGuardInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    if (!hydrated || !accessToken) return;

    const from = searchParams.get("from");
    const destination =
      from && from.startsWith("/") && !from.startsWith("//")
        ? from
        : USER_ROUTES.create;
    router.replace(destination);
  }, [accessToken, hydrated, router, searchParams]);

  if (!hydrated || accessToken) return <LoadingScreen />;

  return children;
}

export function GuestGuard({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <GuestGuardInner>{children}</GuestGuardInner>
    </Suspense>
  );
}
