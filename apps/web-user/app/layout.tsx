import type { Metadata } from "next";
import { AppProviders } from "@vokcg/ui";
import { APP_SUBTITLE, APP_TITLE } from "@vokcg/config";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_SUBTITLE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
