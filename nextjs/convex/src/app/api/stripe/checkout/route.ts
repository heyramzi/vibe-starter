import { NextResponse } from 'next/server'
import { z } from 'zod'
import { StripeService } from '@/lib/stripe'
import { requireAuth, requireOrg, requireRole } from '@/lib/middleware'

const checkoutSchema = z.object({
  priceId: z.string().startsWith('price_'),
})

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth()
    const { organization, role } = await requireOrg(user.id)

    requireRole(role, 'owner')

    const body = await request.json()
    const { priceId } = checkoutSchema.parse(body)

    const { url } = await StripeService.createCheckoutSession(
      organization.id,
      priceId,
      user.email!
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
