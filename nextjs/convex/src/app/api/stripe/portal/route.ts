import { NextResponse } from 'next/server'
import { z } from 'zod'
import { StripeService } from '@/lib/stripe'

const portalSchema = z.object({
  organizationId: z.string(),
})

export async function POST(request: Request) {
  try {
    // TODO: Validate auth token from Convex
    // For now, client must send organizationId

    const body = await request.json()
    const { organizationId } = portalSchema.parse(body)

    const { url } = await StripeService.createPortalSession(organizationId)

    if (!url) {
      throw new Error('Failed to create portal session')
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Portal failed' },
      { status: 400 }
    )
  }
}
