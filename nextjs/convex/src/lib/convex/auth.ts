"use client"

import { authClient } from "@/lib/auth-client"

export function useConvexAuth() {
	return {
		async sendOTP(email: string) {
			return authClient.emailOtp.sendVerificationOtp({
				email,
				type: "sign-in",
			})
		},

		async verifyOTP(email: string, code: string) {
			return authClient.signIn.emailOtp({
				email,
				otp: code,
			})
		},

		async signOut() {
			return authClient.signOut()
		},
	}
}
