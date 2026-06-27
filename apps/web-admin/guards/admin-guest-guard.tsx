"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { ADMIN_ROUTES } from "@vokcg/constants";
import { LoadingScreen } from "@vokcg/ui";
import { useAdminAuthHydration } from "@/hooks";

export function AdminGuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken, isReady } = useAdminAuthHydration();

  useEffect(() => {
    if (!isReady || !accessToken) return;

    const from = searchParams.get("from");
    const destination =
      from && from.startsWith("/") && !from.startsWith("//")
        ? from
        : ADMIN_ROUTES.overview;
    router.replace(destination);
  }, [accessToken, isReady, router, searchParams]);

  if (!isReady || accessToken) return <LoadingScreen />;

  return children;
}
