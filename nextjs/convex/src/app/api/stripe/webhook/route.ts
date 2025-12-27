import { NextResponse } from 'next/server'
import { WebhookHandler } from '@/lib/stripe'
import { env } from '@/lib/env'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  try {
    const event = await WebhookHandler.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)

    await WebhookHandler.handleEvent(event)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook failed' },
      { status: 400 }
    )
  }
}
