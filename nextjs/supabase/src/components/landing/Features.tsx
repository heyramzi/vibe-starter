import { Lock, RefreshCw, Palette, Zap, Globe, Shield } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Launch in 60 seconds',
    description:
      'Connect your ClickUp workspace and create your first portal instantly. No coding required.',
  },
  {
    icon: RefreshCw,
    title: 'Real-time sync',
    description:
      'Changes in ClickUp appear in your portal automatically. Always up-to-date.',
  },
  {
    icon: Lock,
    title: 'Password protected',
    description:
      'Secure portals with simple password access. No complex client onboarding.',
  },
  {
    icon: Palette,
    title: 'Fully branded',
    description:
      'Custom subdomain, colors, and logo. Your brand, your client experience.',
  },
  {
    icon: Globe,
    title: 'Custom domains',
    description:
      'Use your own domain for a professional, white-label experience.',
  },
  {
    icon: Shield,
    title: 'Client-friendly',
    description:
      'Clean interface clients can understand. No ClickUp account needed.',
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-16 md:py-24">
      <div className="container-marketing">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Everything you need for client transparency
          </h2>
          <p className="text-lg text-[var(--gray-700)]">
            Stop sending status emails. Give clients a live view of their
            project.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--upsys-purple)]/5"
            >
              <div className="mb-5 inline-flex rounded-xl bg-[var(--upsys-purple)]/10 p-3">
                <feature.icon className="h-6 w-6 text-[var(--upsys-purple)]" />
              </div>
              <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>
              <p className="text-[var(--gray-700)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
