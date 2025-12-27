import type { OrgRole } from '@/lib/stripe'

const roleHierarchy: Record<OrgRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
}

// Check if user has required role or higher
export function requireRole(userRole: OrgRole, requiredRole: OrgRole): void {
  if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
    throw new Error(`Requires ${requiredRole} role`)
  }
}
