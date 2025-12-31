import { Metadata } from 'next'
import { PricingTable } from '@/components/pricing'

export const metadata: Metadata = {
  title: 'Pricing | Vibe Starter',
  description: 'Simple, transparent pricing for teams of all sizes.',
}

export default function PricingPage() {
  // For Convex, organization context is fetched client-side using useQuery
  // The PricingTable component handles this internally

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
        <PricingTable />

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
