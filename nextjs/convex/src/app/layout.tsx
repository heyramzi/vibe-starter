import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { UmamiScript } from '@/components/analytics'
import { ConvexClientProvider } from '@/lib/convex'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Vibe Starter',
  description: 'Next.js starter with Convex, TailwindCSS, and TypeScript',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
        <Toaster />
        <UmamiScript />
      </body>
    </html>
  )
}
