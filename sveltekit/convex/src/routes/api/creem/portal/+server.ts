import { json, error, type RequestEvent } from '@sveltejs/kit'
import { CreemService } from '$lib/creem'

export async function POST({ request }: RequestEvent) {
	// TODO: Implement Convex auth check for server-side routes
	// For now, the route is public - add auth token validation if needed

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
