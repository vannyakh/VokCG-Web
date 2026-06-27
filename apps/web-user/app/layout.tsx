import { AppProviders, ColorModeProvider } from "@vokcg/ui";
import { siteMetadata } from "./metadata";
import "./globals.css";

export const metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ColorModeProvider>
          <AppProviders>{children}</AppProviders>
        </ColorModeProvider>
      </body>
    </html>
  );
}
