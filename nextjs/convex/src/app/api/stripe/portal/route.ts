import { NextResponse } from 'next/server'
import { StripeService } from '@/lib/stripe'
import { requireAuth, requireOrg, requireRole } from '@/lib/middleware'

export async function POST() {
  try {
    const { user } = await requireAuth()
    const { organization, role } = await requireOrg(user.id)

    requireRole(role, 'owner')

    const { url } = await StripeService.createPortalSession(organization.id)

    if (!url) {
      throw new Error('Failed to create portal session')
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Portal failed' },
      { status: 400 }
    )
  }
}
