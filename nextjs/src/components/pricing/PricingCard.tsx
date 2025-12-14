'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PricingPlan, BillingInterval } from '@/lib/stripe/plans'
import { formatPrice, calculateYearlySavings } from '@/lib/stripe/plans'

interface PricingCardProps {
  plan: PricingPlan
  interval: BillingInterval
  onSelect: (priceId: string) => void
  isLoading?: boolean
  currentPlan?: boolean
}

export function PricingCard({
  plan,
  interval,
  onSelect,
  isLoading,
  currentPlan,
}: PricingCardProps) {
  const price = plan.prices[interval]
  const yearlySavings = interval === 'year' ? calculateYearlySavings(plan) : 0

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        plan.highlighted && 'border-primary shadow-md'
      )}
    >
      {plan.badge && (
        <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          {plan.badge}
        </Badge>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-6 text-center">
          <span className="text-4xl font-bold">
            {formatPrice(price.amount, interval).split('/')[0]}
          </span>
          <span className="text-muted-foreground">
            /{interval === 'month' ? 'mo' : 'yr'}
          </span>
          {interval === 'year' && yearlySavings > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Save ${yearlySavings}/year
            </p>
          )}
        </div>

        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={plan.highlighted ? 'default' : 'outline'}
          onClick={() => onSelect(price.id)}
          disabled={isLoading || currentPlan}
        >
          {currentPlan ? 'Current Plan' : isLoading ? 'Loading...' : 'Get Started'}
        </Button>
      </CardFooter>
    </Card>
  )
}
