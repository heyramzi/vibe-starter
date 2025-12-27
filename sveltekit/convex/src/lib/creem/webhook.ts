import { creem } from './client'
import type { WebhookHandlerOptions, GrantAccessEvent, RevokeAccessEvent } from './types'

interface CreemWebhookContext {
	metadata?: Record<string, unknown>
	customer: { id: string; email: string }
	subscription?: { id: string }
	product: { id: string }
	reason: string
}

export function createWebhookHandler(options: WebhookHandlerOptions) {
	return async (body: string, signature: string): Promise<void> => {
		await creem.webhooks.handleEvents(body, signature, {
			onCheckoutCompleted: options.onCheckoutCompleted,

			onGrantAccess: async (context: CreemWebhookContext) => {
				const event: GrantAccessEvent = {
					referenceId: context.metadata?.referenceId as string,
					customerId: context.customer.id,
					customerEmail: context.customer.email,
					subscriptionId: context.subscription?.id,
					productId: context.product.id,
					reason: context.reason
				}
				await options.onGrantAccess?.(event)
			},

			onRevokeAccess: async (context: CreemWebhookContext) => {
				const event: RevokeAccessEvent = {
					referenceId: context.metadata?.referenceId as string,
					customerId: context.customer.id,
					reason: context.reason
				}
				await options.onRevokeAccess?.(event)
			},

			onSubscriptionCanceled: options.onSubscriptionCanceled,
			onSubscriptionUpdate: options.onSubscriptionUpdate
		})
	}
}
