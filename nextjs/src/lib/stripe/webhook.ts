import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase'
import type { SubscriptionStatus } from '@/lib/stripe/types'

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

// Sync subscription data to database
async function syncSubscription(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organization_id
  if (!organizationId) return

  const supabase = await createServerClient()
  const item = subscription.items.data[0]

  await supabase
    .from('organizations')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: mapStatus(subscription.status),
      seats: item?.quantity || 1,
    })
    .eq('id', organizationId)
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
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await syncSubscription(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata.organization_id
        if (organizationId) {
          const supabase = await createServerClient()
          await supabase
            .from('organizations')
            .update({
              subscription_status: 'canceled',
              stripe_subscription_id: null,
            })
            .eq('id', organizationId)
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
            const supabase = await createServerClient()
            await supabase
              .from('organizations')
              .update({ subscription_status: 'past_due' })
              .eq('id', organizationId)
          }
        }
        break
      }
    }
  },
}
