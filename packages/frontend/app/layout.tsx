import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Steam Bot Multichat',
  description: 'Steam Bot Multichat Operations Console',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-steam-darkblue text-white font-steam">
        {children}
      </body>
    </html>
  )
}
