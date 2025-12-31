import { NextResponse } from 'next/server'
import { z } from 'zod'
import { StripeService } from '@/lib/stripe'

const checkoutSchema = z.object({
  priceId: z.string().startsWith('price_'),
  organizationId: z.string(),
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    // TODO: Validate auth token from Convex
    // For now, client must send organizationId and email

    const body = await request.json()
    const { priceId, organizationId, email } = checkoutSchema.parse(body)

    const { url } = await StripeService.createCheckoutSession(
      organizationId,
      priceId,
      email
    )

    if (!url) {
      throw new Error('Failed to create checkout session')
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 400 }
    )
  }
}
