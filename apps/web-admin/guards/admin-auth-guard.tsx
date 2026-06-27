"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { ADMIN_ROUTES } from "@vokcg/constants";
import { LoadingScreen } from "@vokcg/ui";
import { useAdminAuthHydration } from "@/hooks";

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, isReady } = useAdminAuthHydration();

  useEffect(() => {
    if (!isReady || accessToken) return;

    const from = encodeURIComponent(pathname);
    router.replace(`${ADMIN_ROUTES.login}?from=${from}`);
  }, [accessToken, isReady, pathname, router]);

  if (!isReady || !accessToken) return <LoadingScreen />;

  return children;
}
