// =============================================================================
// SUBSCRIPTION SCHEMA EXAMPLES
// =============================================================================
// Copy the option that fits your use case, delete the other.
// These types define the subscription fields to add to your database tables.
// =============================================================================

// -----------------------------------------------------------------------------
// OPTION A: User-based subscriptions
// Use when: Individual SaaS, no teams/orgs
// -----------------------------------------------------------------------------

export interface UserSubscriptionFields {
	creem_customer_id: string | null
	creem_subscription_id: string | null
	subscription_status: SubscriptionStatus
}

// SQL migration for users table:
// ALTER TABLE users ADD COLUMN creem_customer_id TEXT;
// ALTER TABLE users ADD COLUMN creem_subscription_id TEXT;
// ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'inactive';

// -----------------------------------------------------------------------------
// OPTION B: Organization-based subscriptions
// Use when: Multi-tenant SaaS with teams
// -----------------------------------------------------------------------------

export interface OrgSubscriptionFields {
	creem_customer_id: string | null
	creem_subscription_id: string | null
	subscription_status: SubscriptionStatus
	seats: number
}

// SQL migration for organizations table:
// ALTER TABLE organizations ADD COLUMN creem_customer_id TEXT;
// ALTER TABLE organizations ADD COLUMN creem_subscription_id TEXT;
// ALTER TABLE organizations ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
// ALTER TABLE organizations ADD COLUMN seats INTEGER DEFAULT 1;

// -----------------------------------------------------------------------------
// Shared types
// -----------------------------------------------------------------------------

export type SubscriptionStatus = 'inactive' | 'active' | 'canceled' | 'past_due' | 'trialing'

// Full user type example (Option A)
export interface UserWithSubscription {
	id: string
	email: string
	created_at: string
	// Subscription fields
	creem_customer_id: string | null
	creem_subscription_id: string | null
	subscription_status: SubscriptionStatus
}

// Full organization type example (Option B)
export interface OrganizationWithSubscription {
	id: string
	name: string
	slug: string
	owner_id: string
	created_at: string
	// Subscription fields
	creem_customer_id: string | null
	creem_subscription_id: string | null
	subscription_status: SubscriptionStatus
	seats: number
}

// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------

export function hasActiveSubscription(status: SubscriptionStatus): boolean {
	return status === 'active' || status === 'trialing'
}

export function canAccessPaidFeatures(status: SubscriptionStatus): boolean {
	return status === 'active' || status === 'trialing' || status === 'past_due'
}
