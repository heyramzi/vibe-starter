import { json, error, type RequestEvent } from '@sveltejs/kit'
import { createWebhookHandler } from '$lib/creem'

// Configure your webhook handler with project-specific callbacks
// This example shows user-based subscriptions - modify for your use case
const handleWebhook = createWebhookHandler({
	onGrantAccess: async ({ referenceId, customerId, subscriptionId }) => {
		// TODO: Update your database when access is granted
		// Example for user-based subscriptions:
		//
		// const supabase = createServerClient()
		// await supabase.from('users').update({
		//   creem_customer_id: customerId,
		//   creem_subscription_id: subscriptionId,
		//   subscription_status: 'active'
		// }).eq('id', referenceId)

		console.log('Grant access:', { referenceId, customerId, subscriptionId })
	},

	onRevokeAccess: async ({ referenceId, customerId, reason }) => {
		// TODO: Update your database when access is revoked
		// Example for user-based subscriptions:
		//
		// const supabase = createServerClient()
		// await supabase.from('users').update({
		//   subscription_status: 'inactive'
		// }).eq('id', referenceId)

		console.log('Revoke access:', { referenceId, customerId, reason })
	},

	onSubscriptionCanceled: async (data) => {
		console.log('Subscription canceled:', data)
	},

	onSubscriptionUpdate: async (data) => {
		console.log('Subscription updated:', data)
	}
})

export async function POST({ request }: RequestEvent) {
	const body = await request.text()
	const signature = request.headers.get('creem-signature')

	if (!signature) {
		throw error(400, 'Missing creem-signature header')
	}

	try {
		await handleWebhook(body, signature)
		return json({ received: true })
	} catch (err) {
		console.error('Webhook handling failed:', err)
		throw error(400, 'Invalid webhook signature')
	}
}
