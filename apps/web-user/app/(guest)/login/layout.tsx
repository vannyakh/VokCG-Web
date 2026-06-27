import { USER_ROUTES } from "@vokcg/constants";

import { createPageMetadata } from "../../metadata";

export const metadata = createPageMetadata("Sign in", {
  description: "Sign in to your VokCGStudio account to create AI-powered videos.",
  pathname: USER_ROUTES.login,
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
