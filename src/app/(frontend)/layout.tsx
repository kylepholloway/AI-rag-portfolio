import '@/styles/globals.scss'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { LoggerProvider } from '@/utils/loggerProvider'

export const metadata: Metadata = {
  title: 'Kyle Holloway | AI Portfolio',
  description:
    'An interactive AI portfolio that delivers instant insights into my work, leadership, and expertise.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/android-chrome-192x192.png" sizes="192x192" />
        <link rel="icon" type="image/png" href="/android-chrome-512x512.png" sizes="512x512" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <LoggerProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </LoggerProvider>
      </body>
    </html>
  )
}
