import type { Metadata } from "next";
import { AdminAppProviders } from "@/components/admin-app-providers";
import { APP_TITLE } from "@vokcg/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_TITLE} Admin`,
  description: "Platform administration console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AdminAppProviders>{children}</AdminAppProviders>
      </body>
    </html>
  );
}
