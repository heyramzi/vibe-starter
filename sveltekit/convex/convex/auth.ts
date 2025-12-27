import { convexAuth } from "@convex-dev/auth/server"
import { ResendOTP } from "@convex-dev/auth/providers/ResendOTP"

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    ResendOTP({
      id: "resend-otp",
      apiKey: process.env.RESEND_API_KEY,
      maxAge: 60 * 15, // 15 minutes
    }),
  ],
})
