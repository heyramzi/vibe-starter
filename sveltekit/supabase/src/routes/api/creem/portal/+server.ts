import { json, error, type RequestEvent } from '@sveltejs/kit'
import { CreemService } from '$lib/creem'

export async function POST({ request, locals }: RequestEvent) {
	const { user } = await locals.safeGetSession()
	if (!user) {
		throw error(401, 'Unauthorized')
	}

	const body = await request.json()
	const { customerId } = body

	if (!customerId) {
		throw error(400, 'Missing customerId')
	}

	try {
		const result = await CreemService.createPortal(customerId)
		return json(result)
	} catch (err) {
		console.error('Portal session creation failed:', err)
		throw error(500, 'Failed to create portal session')
	}
}
