import { createServerClient } from '@/lib/supabase'
import type { Organization, OrgRole } from '@/lib/stripe'

export interface OrgContext {
  organization: Organization
  role: OrgRole
}

// Get user's organization with active subscription
export async function requireSubscription(userId: string): Promise<OrgContext> {
  const supabase = await createServerClient()

  const { data: membership, error } = await supabase
    .from('organization_members')
    .select('role, organizations(*)')
    .eq('user_id', userId)
    .single()

  if (error || !membership?.organizations) {
    throw new Error('No organization found')
  }

  const org = membership.organizations as unknown as Organization

  if (org.subscription_status !== 'active' && org.subscription_status !== 'trialing') {
    throw new Error('Subscription required')
  }

  return {
    organization: org,
    role: membership.role as OrgRole,
  }
}

// Get user's organization (no subscription check)
export async function requireOrg(userId: string): Promise<OrgContext> {
  const supabase = await createServerClient()

  const { data: membership, error } = await supabase
    .from('organization_members')
    .select('role, organizations(*)')
    .eq('user_id', userId)
    .single()

  if (error || !membership?.organizations) {
    throw new Error('No organization found')
  }

  return {
    organization: membership.organizations as unknown as Organization,
    role: membership.role as OrgRole,
  }
}
