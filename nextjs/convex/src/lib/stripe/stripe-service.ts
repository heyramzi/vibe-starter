import { stripe } from '@/lib/stripe/client'
import { env } from '@/lib/env'

interface Organization {
  _id: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  plan?: string
}

// Get or create Stripe customer for organization
async function getOrCreateCustomer(org: Organization, email: string): Promise<string> {
  if (org.stripeCustomerId) {
    return org.stripeCustomerId
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { organization_id: org._id },
  })

  // TODO: Create a Convex mutation to update organization with stripeCustomerId
  console.log('Created Stripe customer:', customer.id, 'for org:', org._id)

  return customer.id
}

export const StripeService = {
  // Create checkout session for subscription
  async createCheckoutSession(organizationId: string, priceId: string, userEmail: string) {
    // TODO: Fetch organization from Convex
    const org: Organization = { _id: organizationId }

    const customerId = await getOrCreateCustomer(org, userEmail)

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      subscription_data: {
        metadata: { organization_id: organizationId },
      },
    })

    return { url: session.url }
  },

  // Create customer portal session
  async createPortalSession(_organizationId: string) {
    // TODO: Fetch organization from Convex to get stripeCustomerId
    const stripeCustomerId = '' // Get from org

    if (!stripeCustomerId) {
      throw new Error('No billing account found')
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/billing`,
    })

    return { url: session.url }
  },

  // Update subscription seat count
  async updateSeats(organizationId: string, seats: number) {
    // TODO: Fetch organization from Convex
    const stripeSubscriptionId = '' // Get from org

    if (!stripeSubscriptionId) {
      throw new Error('No active subscription')
    }

    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
    const itemId = subscription.items.data[0]?.id

    if (!itemId) {
      throw new Error('Subscription item not found')
    }

    await stripe.subscriptionItems.update(itemId, { quantity: seats })

    // TODO: Update seats in Convex

    return { seats }
  },
}
