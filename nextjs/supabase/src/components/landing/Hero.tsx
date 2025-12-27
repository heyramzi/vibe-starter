import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import { GlowButton } from './GlowButton'

export function Hero() {
  return (
    <section className="relative pt-20 pb-8 md:pt-32 md:pb-12">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.58_0.14_272.32_/_0.08),transparent)]" />

      <div className="container-marketing-small">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-[var(--gray-100)] px-4 py-1.5 text-sm text-[var(--gray-700)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--upsys-magenta)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--upsys-magenta)]" />
            </span>
            Now in Beta
          </div>

          {/* Headline */}
          <h1 className="mb-8 text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Turn ClickUp into{' '}
            <span className="text-[var(--upsys-purple)]">
              beautiful client portals
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-16 max-w-2xl text-lg leading-relaxed text-[var(--gray-700)] md:text-xl lg:text-2xl">
            Create branded, password-protected dashboards for your clients in
            under 60 seconds. Real-time sync with ClickUp. No client login
            required.
          </p>

          {/* CTAs */}
          <div className="mb-32 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <GlowButton href="/auth/signup">Start Free Trial</GlowButton>
            <Button
              variant="ghost"
              size="lg"
              className="gap-2 text-[var(--gray-700)] hover:text-foreground"
              asChild
            >
              <Link href="#demo">
                <Play className="h-4 w-4" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Social proof */}
          <p className="text-sm text-[var(--gray-500)]">
            Trusted by 50+ agencies managing client projects
          </p>
        </div>
      </div>
    </section>
  )
}
