import { convexAuth } from "@convex-dev/auth/server"
import { Email } from "@convex-dev/auth/providers/Email"
import { generateRandomString, type RandomReader } from "@oslojs/crypto/random"

const random: RandomReader = {
  read(bytes: Uint8Array): void {
    crypto.getRandomValues(bytes)
  },
}

function generateOTP(length: number): string {
  const digits = "0123456789"
  return generateRandomString(random, digits, length)
}

async function sendEmailWithUnoSend(options: {
  to: string
  subject: string
  html: string
}) {
  const response = await fetch("https://www.unosend.co/api/v1/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UNOSEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "noreply@example.com",
      to: [options.to],
      subject: options.subject,
      html: options.html,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message ?? `Email failed: ${response.status}`)
  }
}

const EmailOTP = Email({
  id: "email-otp",
  apiKey: process.env.UNOSEND_API_KEY,
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    return generateOTP(6)
  },
  async sendVerificationRequest({ identifier: email, token }) {
    await sendEmailWithUnoSend({
      to: email,
      subject: "Your verification code",
      html: `<p>Your verification code is: <strong>${token}</strong></p><p>This code expires in 15 minutes.</p>`,
    })
  },
})

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [EmailOTP],
})
