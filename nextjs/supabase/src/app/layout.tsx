import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { UmamiScript } from '@/components/analytics'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Vibe Starter',
  description: 'Next.js starter with Supabase, TailwindCSS, and TypeScript',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster />
        <UmamiScript />
      </body>
    </html>
  )
}
