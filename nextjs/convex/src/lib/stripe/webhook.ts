import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import type { SubscriptionStatus } from '@/lib/stripe/types'
import { pricingPlans } from '@/lib/stripe/plans'
import { EmailService } from '@/lib/email'

// Map Stripe status to our status
function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
    active: 'active',
    canceled: 'canceled',
    incomplete: 'inactive',
    incomplete_expired: 'inactive',
    past_due: 'past_due',
    paused: 'inactive',
    trialing: 'trialing',
    unpaid: 'past_due',
  }
  return statusMap[status] || 'inactive'
}

// Get customer email from Stripe
async function getCustomerEmail(customerId: string | Stripe.Customer | Stripe.DeletedCustomer | null): Promise<string | null> {
  if (!customerId) return null
  if (typeof customerId !== 'string') {
    return 'deleted' in customerId ? null : customerId.email
  }
  const customer = await stripe.customers.retrieve(customerId)
  return 'deleted' in customer ? null : customer.email
}

// Get plan name from price ID
function getPlanName(priceId: string): string {
  for (const plan of pricingPlans) {
    if (plan.prices.month.id === priceId || plan.prices.year.id === priceId) {
      return plan.name
    }
  }
  return 'Plan'
}

// Send email without blocking webhook (fire-and-forget)
function sendEmailAsync(fn: () => Promise<unknown>) {
  fn().catch((err) => console.error('Email send failed:', err))
}

// Sync subscription data to Convex database
async function syncSubscription(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organization_id
  if (!organizationId) return

  // TODO: Create a Convex mutation for updating organization subscription
  // Use ConvexHttpClient to call the mutation
  console.log('Sync subscription:', organizationId, mapStatus(subscription.status))
}

export const WebhookHandler = {
  // Verify and parse webhook event
  async constructEvent(body: string, signature: string, secret: string) {
    return stripe.webhooks.constructEvent(body, signature, secret)
  },

  // Handle webhook event
  async handleEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          await syncSubscription(subscription)

          // Send subscription created email
          const email = await getCustomerEmail(session.customer)
          const priceId = subscription.items.data[0]?.price.id
          if (email && priceId) {
            const planName = getPlanName(priceId)
            sendEmailAsync(() => EmailService.sendSubscriptionCreated(email, planName))
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await syncSubscription(subscription)

        // Send subscription updated email
        const email = await getCustomerEmail(subscription.customer)
        const priceId = subscription.items.data[0]?.price.id
        if (email && priceId) {
          const planName = getPlanName(priceId)
          sendEmailAsync(() => EmailService.sendSubscriptionUpdated(email, planName))
        }
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await syncSubscription(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata.organization_id
        if (organizationId) {
          // TODO: Create a Convex mutation for canceling subscription
          console.log('Cancel subscription:', organizationId)

          // Send subscription cancelled email
          const email = await getCustomerEmail(subscription.customer)
          const subscriptionItem = subscription.items.data[0]
          if (email && subscriptionItem) {
            const planName = getPlanName(subscriptionItem.price.id)
            const endDate = new Date(subscriptionItem.current_period_end * 1000).toLocaleDateString()
            sendEmailAsync(() => EmailService.sendSubscriptionCancelled(email, planName, endDate))
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionRef = invoice.parent?.subscription_details?.subscription
        if (subscriptionRef) {
          const subscriptionId = typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef.id
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const organizationId = subscription.metadata.organization_id
          if (organizationId) {
            // TODO: Create a Convex mutation for marking subscription past due
            console.log('Payment failed:', organizationId)

            // Send payment failed email
            const email = await getCustomerEmail(subscription.customer)
            const priceId = subscription.items.data[0]?.price.id
            if (email && priceId) {
              const planName = getPlanName(priceId)
              sendEmailAsync(() => EmailService.sendPaymentFailed(email, planName))
            }
          }
        }
        break
      }
    }
  },
}
