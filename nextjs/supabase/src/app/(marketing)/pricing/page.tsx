import { Metadata } from 'next'
import { PricingTable } from '@/components/pricing'
import { createServerClient } from '@/lib/supabase'
import type { Organization } from '@/lib/stripe'

export const metadata: Metadata = {
  title: 'Pricing | Vibe Starter',
  description: 'Simple, transparent pricing for teams of all sizes.',
}

async function getOrgContext() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: membership } = await supabase
      .from('organization_members')
      .select('organizations(*)')
      .eq('user_id', user.id)
      .single()

    if (!membership?.organizations) return null

    const org = membership.organizations as unknown as Organization
    return {
      organizationId: org.id,
      currentPlanId: org.subscription_status === 'active' ? 'current' : undefined,
    }
  } catch {
    return null
  }
}

export default async function PricingPage() {
  const context = await getOrgContext()

  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your team. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Table */}
        <PricingTable
          organizationId={context?.organizationId}
          currentPlanId={context?.currentPlanId}
        />

        {/* FAQ or additional info */}
        <div className="mx-auto mt-20 max-w-2xl text-center">
          <p className="text-sm text-muted-foreground">
            All prices are per seat, billed monthly or annually.
            <br />
            Need a custom plan?{' '}
            <a href="mailto:sales@example.com" className="underline hover:text-foreground">
              Contact sales
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
