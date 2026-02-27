import { createClient, type GenericCtx } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { components } from "./_generated/api"
import type { DataModel } from "./_generated/dataModel"
import { query } from "./_generated/server"
import { betterAuth } from "better-auth/minimal"
import { emailOTP } from "better-auth/plugins"
import authConfig from "./auth.config"

const siteUrl = process.env.SITE_URL!

export const authComponent = createClient<DataModel>(components.betterAuth)

export const createAuth = (ctx: GenericCtx<DataModel>) => {
	return betterAuth({
		baseURL: siteUrl,
		database: authComponent.adapter(ctx),
		plugins: [
			convex({ authConfig }),
			emailOTP({
				async sendVerificationOTP({ email, otp, type }) {
					const res = await fetch("https://api.resend.com/emails", {
						method: "POST",
						headers: {
							Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							from: process.env.EMAIL_FROM ?? "noreply@example.com",
							to: [email],
							subject: `${otp} is your verification code`,
							html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 5 minutes.</p>`,
						}),
					})
					if (!res.ok) {
						throw new Error(`Failed to send email: ${res.status}`)
					}
				},
				otpLength: 6,
				expiresIn: 300,
			}),
		],
	})
}

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		return authComponent.getAuthUser(ctx)
	},
})
