import { goto } from '$app/navigation'

export interface CheckoutParams {
	productId: string
	referenceId: string
	units?: number
	discountCode?: string
	successUrl?: string
}

export interface PortalParams {
	customerId: string
}

export async function createCheckout(params: CheckoutParams): Promise<void> {
	const response = await fetch('/api/creem/checkout', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(params)
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to create checkout' }))
		throw new Error(error.message || 'Failed to create checkout')
	}

	const { url } = await response.json()
	await goto(url, { replaceState: false })
}

export async function openPortal(params: PortalParams): Promise<void> {
	const response = await fetch('/api/creem/portal', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(params)
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to create portal session' }))
		throw new Error(error.message || 'Failed to create portal session')
	}

	const { url } = await response.json()
	await goto(url, { replaceState: false })
}
