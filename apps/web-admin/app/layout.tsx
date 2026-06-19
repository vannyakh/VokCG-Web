import type { Metadata } from 'next'
import { AppProviders } from '@vokcg/ui'
import { APP_TITLE } from '@vokcg/config'
import './globals.css'

export const metadata: Metadata = {
  title: `${APP_TITLE} Admin`,
  description: 'Platform administration console',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
