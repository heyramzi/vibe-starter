import { env } from "@/lib/env"
import type { SendEmailOptions, EmailResponse } from "./types"
import {
  welcomeEmail,
  magicLinkEmail,
  subscriptionCreatedEmail,
  subscriptionUpdatedEmail,
  subscriptionCancelledEmail,
  paymentFailedEmail,
} from "./templates"

const UNOSEND_API_URL = "https://www.unosend.co/api/v1/emails"

// EmailService using const service pattern
export const EmailService = {
  // Core send function
  async send(options: SendEmailOptions): Promise<EmailResponse> {
    const apiKey = env.UNOSEND_API_KEY
    if (!apiKey) {
      throw new Error("UNOSEND_API_KEY is not configured")
    }

    const response = await fetch(UNOSEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: options.from ?? env.EMAIL_FROM,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: "Unknown error" } }))
      throw new Error(error.error?.message ?? `Email failed: ${response.status}`)
    }

    return response.json()
  },

  // Template-based sends
  async sendWelcome(to: string, options?: { name?: string; appName?: string; dashboardUrl?: string }) {
    const { subject, html } = welcomeEmail(options)
    return this.send({ to, subject, html })
  },

  async sendMagicLink(to: string, code: string, appName?: string) {
    const { subject, html } = magicLinkEmail({ code, appName })
    return this.send({ to, subject, html })
  },

  async sendSubscriptionCreated(to: string, planName: string, options?: { appName?: string; billingUrl?: string }) {
    const { subject, html } = subscriptionCreatedEmail({ planName, ...options })
    return this.send({ to, subject, html })
  },

  async sendSubscriptionUpdated(to: string, planName: string, options?: { appName?: string; billingUrl?: string }) {
    const { subject, html } = subscriptionUpdatedEmail({ planName, ...options })
    return this.send({ to, subject, html })
  },

  async sendSubscriptionCancelled(to: string, planName: string, endDate: string, options?: { appName?: string; billingUrl?: string }) {
    const { subject, html } = subscriptionCancelledEmail({ planName, endDate, ...options })
    return this.send({ to, subject, html })
  },

  async sendPaymentFailed(to: string, planName: string, options?: { appName?: string; billingUrl?: string }) {
    const { subject, html } = paymentFailedEmail({ planName, ...options })
    return this.send({ to, subject, html })
  },
}
