import { convexAuth } from "@convex-dev/auth/server"
import { Email } from "@convex-dev/auth/providers/Email"
import { generateRandomString, type RandomReader } from "@oslojs/crypto/random"
import { Resend } from "resend"

const random: RandomReader = {
  read(bytes: Uint8Array): void {
    crypto.getRandomValues(bytes)
  },
}

function generateOTP(length: number): string {
  const digits = "0123456789"
  return generateRandomString(random, digits, length)
}

const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.RESEND_API_KEY,
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    return generateOTP(6)
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new Resend(provider.apiKey)
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "noreply@example.com",
      to: [email],
      subject: "Your verification code",
      text: `Your verification code is: ${token}`,
    })
    if (error) {
      throw new Error(JSON.stringify(error))
    }
  },
})

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [ResendOTP],
})
