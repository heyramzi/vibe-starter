"use client"

import { useAuthActions } from "@convex-dev/auth/react"

export function useConvexAuth() {
  const { signIn, signOut } = useAuthActions()

  return {
    async sendOTP(email: string) {
      return signIn("resend-otp", { email })
    },

    async verifyOTP(email: string, code: string) {
      return signIn("resend-otp", { email, code })
    },

    async signOut() {
      return signOut()
    },
  }
}
