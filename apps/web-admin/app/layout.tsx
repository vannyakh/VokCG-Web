import type { Metadata } from "next";
import { AdminAppProviders } from "@/providers";
import { ColorModeProvider } from "@vokcg/ui";
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
        <ColorModeProvider>
          <AdminAppProviders>{children}</AdminAppProviders>
        </ColorModeProvider>
      </body>
    </html>
  );
}
