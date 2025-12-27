import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase'
import { env } from '@/lib/env'
import type { Organization } from '@/lib/stripe/types'

// Get or create Stripe customer for organization
async function getOrCreateCustomer(org: Organization, email: string): Promise<string> {
  if (org.stripe_customer_id) {
    return org.stripe_customer_id
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { organization_id: org.id },
  })

  const supabase = await createServerClient()
  await supabase
    .from('organizations')
    .update({ stripe_customer_id: customer.id })
    .eq('id', org.id)

  return customer.id
}

export const StripeService = {
  // Create checkout session for subscription
  async createCheckoutSession(organizationId: string, priceId: string, userEmail: string) {
    const supabase = await createServerClient()

    const { data: org, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (error || !org) {
      throw new Error('Organization not found')
    }

    const customerId = await getOrCreateCustomer(org as Organization, userEmail)

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: org.seats || 1 }],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      subscription_data: {
        metadata: { organization_id: organizationId },
      },
    })

    return { url: session.url }
  },

  // Create customer portal session
  async createPortalSession(organizationId: string) {
    const supabase = await createServerClient()

    const { data: org, error } = await supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', organizationId)
      .single()

    if (error || !org?.stripe_customer_id) {
      throw new Error('No billing account found')
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/billing`,
    })

    return { url: session.url }
  },

  // Update subscription seat count
  async updateSeats(organizationId: string, seats: number) {
    const supabase = await createServerClient()

    const { data: org, error } = await supabase
      .from('organizations')
      .select('stripe_subscription_id')
      .eq('id', organizationId)
      .single()

    if (error || !org?.stripe_subscription_id) {
      throw new Error('No active subscription')
    }

    const subscription = await stripe.subscriptions.retrieve(org.stripe_subscription_id)
    const itemId = subscription.items.data[0]?.id

    if (!itemId) {
      throw new Error('Subscription item not found')
    }

    await stripe.subscriptionItems.update(itemId, { quantity: seats })

    await supabase.from('organizations').update({ seats }).eq('id', organizationId)

    return { seats }
  },
}
