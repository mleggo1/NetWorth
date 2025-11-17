import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Net Worth Engine & Financial Freedom Scorecard',
  description: 'Track your net worth and plan for financial freedom',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

