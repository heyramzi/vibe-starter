const steps = [
  {
    step: '01',
    title: 'Connect ClickUp',
    description:
      'Authorize Glance to access your ClickUp workspace. One-click OAuth connection.',
  },
  {
    step: '02',
    title: 'Select your list',
    description:
      'Choose which ClickUp list or folder you want to share with your client.',
  },
  {
    step: '03',
    title: 'Customize',
    description:
      'Add your logo, set colors, choose a subdomain, and set a password.',
  },
  {
    step: '04',
    title: 'Share',
    description:
      'Send your client the portal link and password. They see updates instantly.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 md:py-24 bg-[var(--gray-100)]">
      <div className="container-marketing-small">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">How it works</h2>
          <p className="text-lg text-[var(--gray-700)]">
            From ClickUp to client portal in four simple steps
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-10 hidden h-px w-full bg-[var(--gray-300)] lg:block" />
              )}

              <div className="relative flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-[var(--upsys-purple)] bg-background text-2xl font-bold text-[var(--upsys-purple)]">
                  {item.step}
                </div>
                <h3 className="mb-3 text-lg font-semibold">{item.title}</h3>
                <p className="text-[var(--gray-700)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
