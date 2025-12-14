// Subscription status from Stripe
export type SubscriptionStatus = 'inactive' | 'active' | 'canceled' | 'past_due' | 'trialing'

// Organization role
export type OrgRole = 'owner' | 'admin' | 'member'

// Database types
export interface Organization {
  id: string
  name: string
  slug: string
  owner_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: SubscriptionStatus
  seats: number
  created_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: OrgRole
  created_at: string
}

// API response types
export interface CheckoutSessionResponse {
  url: string
}

export interface PortalSessionResponse {
  url: string
}
