export type BillingInterval = 'month' | 'year'

export interface PricingPlan {
	id: string
	name: string
	description: string
	features: string[]
	productIds: {
		month: string
		year: string
	}
	prices: {
		month: number
		year: number
	}
	highlighted?: boolean
	badge?: string
}

// Configure your pricing plans here
// Product IDs should match your Creem dashboard
export const pricingPlans: PricingPlan[] = [
	{
		id: 'starter',
		name: 'Starter',
		description: 'For individuals getting started',
		features: ['Up to 5 projects', '10GB storage', 'Email support'],
		productIds: {
			month: 'prod_starter_monthly',
			year: 'prod_starter_yearly'
		},
		prices: { month: 29, year: 290 }
	},
	{
		id: 'pro',
		name: 'Pro',
		description: 'For growing teams',
		features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'],
		productIds: {
			month: 'prod_pro_monthly',
			year: 'prod_pro_yearly'
		},
		prices: { month: 79, year: 790 },
		highlighted: true,
		badge: 'Popular'
	}
]

export function formatPrice(amount: number, interval: BillingInterval): string {
	const formatted = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0
	}).format(amount)

	return `${formatted}/${interval === 'month' ? 'mo' : 'yr'}`
}

export function getProductId(planId: string, interval: BillingInterval): string | undefined {
	const plan = pricingPlans.find((p) => p.id === planId)
	return plan?.productIds[interval]
}

export function calculateYearlySavings(plan: PricingPlan): number {
	const monthlyTotal = plan.prices.month * 12
	const yearlyTotal = plan.prices.year
	return monthlyTotal - yearlyTotal
}
