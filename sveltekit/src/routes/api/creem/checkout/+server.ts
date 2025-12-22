import { json, error, type RequestEvent } from '@sveltejs/kit'
import { CreemService } from '$lib/creem'
import { env } from '$env/dynamic/public'

export async function POST({ request, locals }: RequestEvent) {
	// Optional: require authentication
	const { user } = await locals.safeGetSession()
	if (!user) {
		throw error(401, 'Unauthorized')
	}

	const body = await request.json()
	const { productId, referenceId, units, discountCode, successUrl } = body

	if (!productId || !referenceId) {
		throw error(400, 'Missing productId or referenceId')
	}

	try {
		const result = await CreemService.createCheckout({
			productId,
			referenceId,
			units,
			discountCode,
			successUrl: successUrl ?? `${env.PUBLIC_APP_URL}/billing?success=true`,
			customer: user.email ? { email: user.email } : undefined
		})

		return json(result)
	} catch (err) {
		console.error('Checkout creation failed:', err)
		throw error(500, 'Failed to create checkout session')
	}
}
