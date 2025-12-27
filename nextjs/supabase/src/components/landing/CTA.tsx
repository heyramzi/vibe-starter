import { GlowButton } from './GlowButton'

export function CTA() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="container-marketing-small">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--gray-900)] px-8 py-16 text-center md:px-16 md:py-24">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.58_0.14_272.32_/_0.15),transparent)]" />

          <div className="relative">
            <h2 className="mb-6 text-3xl font-bold text-[var(--gray-50)] md:text-4xl lg:text-5xl">
              Ready to impress your clients?
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-[var(--gray-300)]">
              Start your free trial today. No credit card required. Create your
              first portal in under a minute.
            </p>
            <GlowButton href="/auth/signup">Get Started Free</GlowButton>
          </div>
        </div>
      </div>
    </section>
  )
}
