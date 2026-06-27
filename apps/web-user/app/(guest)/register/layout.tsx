import { USER_ROUTES } from "@vokcg/constants";

import { createPageMetadata } from "../../metadata";

export const metadata = createPageMetadata("Create account", {
  description:
    "Create a VokCGStudio account and start generating AI videos with avatars, voice, and scripts.",
  pathname: USER_ROUTES.register,
});

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
