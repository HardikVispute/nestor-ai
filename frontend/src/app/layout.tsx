import type { Metadata } from 'next'
import 'typeface-glacial-indifference'
import './globals.css'
import { PerformanceProvider } from '@/contexts/PerformanceContext'

export const metadata: Metadata = {
  title: 'NESTOR AI | Property Valuation Intelligence',
  description:
    'Institutional AI-powered property valuation and market intelligence platform for Indian residential real estate',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-black text-white font-body antialiased">
        <PerformanceProvider>{children}</PerformanceProvider>
      </body>
    </html>
  )
}
