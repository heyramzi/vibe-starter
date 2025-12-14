'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PricingCard } from './PricingCard'
import { pricingPlans, type BillingInterval } from '@/lib/stripe/plans'
import { cn } from '@/lib/utils'

interface PricingTableProps {
  currentPlanId?: string
  organizationId?: string
}

export function PricingTable({ currentPlanId, organizationId }: PricingTableProps) {
  const router = useRouter()
  const [interval, setInterval] = useState<BillingInterval>('month')
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)

  async function handleSelectPlan(priceId: string) {
    if (!organizationId) {
      router.push('/login?redirect=/pricing')
      return
    }

    setLoadingPriceId(priceId)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
      setLoadingPriceId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Interval Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-lg border p-1">
          <button
            onClick={() => setInterval('month')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              interval === 'month'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('year')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              interval === 'year'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Yearly
            <span className="ml-1.5 text-xs opacity-75">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            interval={interval}
            onSelect={handleSelectPlan}
            isLoading={loadingPriceId === plan.prices[interval].id}
            currentPlan={currentPlanId === plan.id}
          />
        ))}
      </div>
    </div>
  )
}
