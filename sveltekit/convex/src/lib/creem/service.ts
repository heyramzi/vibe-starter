import { creem } from './client'
import type { CheckoutOptions, CheckoutResult, PortalResult } from './types'

export const CreemService = {
	async createCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
		const checkoutParams: Parameters<typeof creem.checkouts.create>[0] = {
			productId: options.productId,
			units: options.units ?? 1,
			metadata: {
				referenceId: options.referenceId,
				...options.metadata
			},
			customer: options.customer,
			discountCode: options.discountCode
		}

		// Only add successUrl if provided
		if (options.successUrl) {
			checkoutParams.successUrl = options.successUrl
		}

		const checkout = await creem.checkouts.create(checkoutParams)

		if (!checkout.checkoutUrl) {
			throw new Error('Checkout URL not returned from Creem')
		}

		return { url: checkout.checkoutUrl }
	},

	async createPortal(customerId: string): Promise<PortalResult> {
		const portal = await creem.customers.createPortal({ customerId })
		return { url: portal.customerPortalLink }
	},

	async getSubscription(subscriptionId: string) {
		return creem.subscriptions.get({ subscriptionId })
	},

	async updateSeats(subscriptionId: string, itemId: string, units: number) {
		return creem.subscriptions.update({
			subscriptionId,
			items: [{ id: itemId, units }],
			updateBehavior: 'proration-charge-immediately'
		})
	},

	async cancelSubscription(subscriptionId: string) {
		return creem.subscriptions.cancel({ subscriptionId })
	}
}
