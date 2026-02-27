import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	organizations: defineTable({
		name: v.string(),
		stripeCustomerId: v.optional(v.string()),
		stripeSubscriptionId: v.optional(v.string()),
		plan: v.optional(v.string()),
		createdAt: v.number(),
	}),

	organizationMembers: defineTable({
		orgId: v.id("organizations"),
		userId: v.id("users"),
		role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
		createdAt: v.number(),
	})
		.index("by_org", ["orgId"])
		.index("by_user", ["userId"])
		.index("by_org_and_user", ["orgId", "userId"]),
})
