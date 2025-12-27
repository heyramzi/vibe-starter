// Pricing plan configuration
// Update these values to match your Stripe products and prices

export type BillingInterval = 'month' | 'year'

export interface PricingPlan {
  id: string
  name: string
  description: string
  features: string[]
  prices: {
    month: { id: string; amount: number }
    year: { id: string; amount: number }
  }
  highlighted?: boolean
  badge?: string
}

// Configure your pricing plans here
// Price IDs should match your Stripe dashboard
export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams getting started',
    features: [
      'Up to 5 team members',
      '10GB storage',
      'Basic analytics',
      'Email support',
    ],
    prices: {
      month: { id: 'price_starter_monthly', amount: 29 },
      year: { id: 'price_starter_yearly', amount: 290 },
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams that need more',
    features: [
      'Up to 20 team members',
      '100GB storage',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'API access',
    ],
    prices: {
      month: { id: 'price_pro_monthly', amount: 79 },
      year: { id: 'price_pro_yearly', amount: 790 },
    },
    highlighted: true,
    badge: 'Popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    features: [
      'Unlimited team members',
      'Unlimited storage',
      'Custom analytics',
      'Dedicated support',
      'Custom integrations',
      'API access',
      'SSO & SAML',
      'SLA guarantee',
    ],
    prices: {
      month: { id: 'price_enterprise_monthly', amount: 199 },
      year: { id: 'price_enterprise_yearly', amount: 1990 },
    },
  },
]

// Helper to format price
export function formatPrice(amount: number, interval: BillingInterval): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)

  return `${formatted}/${interval === 'month' ? 'mo' : 'yr'}`
}

// Calculate savings for yearly billing
export function calculateYearlySavings(plan: PricingPlan): number {
  const monthlyTotal = plan.prices.month.amount * 12
  const yearlyTotal = plan.prices.year.amount
  return monthlyTotal - yearlyTotal
}
