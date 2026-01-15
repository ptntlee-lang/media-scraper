import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Media Scraper',
  description: 'Scrape and view images and videos from websites',
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
