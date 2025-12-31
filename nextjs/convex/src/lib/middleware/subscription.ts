// Subscription middleware for Convex
// Note: In Convex, subscription checks should be done in Convex functions

export type OrgRole = 'owner' | 'admin' | 'member'

export interface OrgContext {
  organizationId: string
  role: OrgRole
}

// Placeholder for subscription patterns
// In Convex, create a query function to check subscription status
export async function requireSubscription(_userId: string): Promise<OrgContext> {
  throw new Error('Use Convex queries instead for subscription checks')
}

export async function requireOrg(_userId: string): Promise<OrgContext> {
  throw new Error('Use Convex queries instead for organization checks')
}
