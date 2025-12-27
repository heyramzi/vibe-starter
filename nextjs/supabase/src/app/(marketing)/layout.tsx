import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function Header() {
  return (
    <header className="glass sticky top-0 z-50">
      <div className="container-marketing flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">Glance</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-sm text-[var(--gray-700)] transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-[var(--gray-700)] transition-colors hover:text-foreground"
          >
            How it Works
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-[var(--gray-700)] transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t bg-[var(--gray-100)]">
      <div className="container-marketing py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Glance</span>
            <span className="text-sm text-[var(--gray-500)]">
              by Upsys Consulting
            </span>
          </div>

          <nav className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-[var(--gray-700)] transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-[var(--gray-700)] transition-colors hover:text-foreground"
            >
              Terms
            </Link>
          </nav>

          <p className="text-sm text-[var(--gray-500)]">
            © {new Date().getFullYear()} Upsys Consulting
          </p>
        </div>
      </div>
    </footer>
  )
}
