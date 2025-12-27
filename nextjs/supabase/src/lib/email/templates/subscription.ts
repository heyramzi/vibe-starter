import { baseTemplate } from "./base"

interface SubscriptionEmailOptions {
  planName: string
  appName?: string
  billingUrl?: string
}

export function subscriptionCreatedEmail({
  planName,
  appName = "Our App",
  billingUrl = "/billing",
}: SubscriptionEmailOptions): { subject: string; html: string } {
  const content = `
    <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      Subscription confirmed
    </h1>
    <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
      You're now subscribed to the <strong>${planName}</strong> plan.
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
      You now have access to all the features included in your plan.
    </p>
    <a href="${billingUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
      Manage Subscription
    </a>
  `

  return {
    subject: `Welcome to ${appName} ${planName}`,
    html: baseTemplate({ content, previewText: `You're now subscribed to ${planName}` }),
  }
}

export function subscriptionUpdatedEmail({
  planName,
  appName = "Our App",
  billingUrl = "/billing",
}: SubscriptionEmailOptions): { subject: string; html: string } {
  const content = `
    <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      Subscription updated
    </h1>
    <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
      Your subscription has been changed to the <strong>${planName}</strong> plan.
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
      Your new features are available immediately.
    </p>
    <a href="${billingUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
      View Details
    </a>
  `

  return {
    subject: `${appName} subscription updated`,
    html: baseTemplate({ content, previewText: `Your plan has been updated to ${planName}` }),
  }
}

interface SubscriptionCancelledOptions {
  planName: string
  endDate: string
  appName?: string
  billingUrl?: string
}

export function subscriptionCancelledEmail({
  planName,
  endDate,
  appName = "Our App",
  billingUrl = "/billing",
}: SubscriptionCancelledOptions): { subject: string; html: string } {
  const content = `
    <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      Subscription cancelled
    </h1>
    <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
      Your <strong>${planName}</strong> subscription has been cancelled.
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
      You'll continue to have access until <strong>${endDate}</strong>.
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
      Changed your mind? You can resubscribe anytime.
    </p>
    <a href="${billingUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
      Resubscribe
    </a>
  `

  return {
    subject: `${appName} subscription cancelled`,
    html: baseTemplate({ content, previewText: `Your subscription ends on ${endDate}` }),
  }
}

export function paymentFailedEmail({
  planName,
  appName = "Our App",
  billingUrl = "/billing",
}: SubscriptionEmailOptions): { subject: string; html: string } {
  const content = `
    <h1 style="color: #dc2626; font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      Payment failed
    </h1>
    <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
      We couldn't process your payment for the <strong>${planName}</strong> plan.
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
      Please update your payment method to avoid service interruption.
    </p>
    <a href="${billingUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
      Update Payment Method
    </a>
  `

  return {
    subject: `Action required: ${appName} payment failed`,
    html: baseTemplate({ content, previewText: "Please update your payment method" }),
  }
}
