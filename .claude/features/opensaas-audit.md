# OpenSaaS Feature Audit for Vibe-Starter

_Audit Date: December 2024_
_Last Updated: December 2024_

This document catalogs features from [OpenSaaS](https://opensaas.sh/) that could enhance Vibe-Starter while maintaining our 簡潔 (simplicity) philosophy.

---

## Executive Summary

OpenSaaS is a feature-complete SaaS starter built on Wasp (React/Node/Prisma). While we won't adopt Wasp, many features can be adapted for Next.js/SvelteKit with Supabase.

### Priority Matrix

| Priority | Feature | Effort | Value | Status |
|----------|---------|--------|-------|--------|
| **P0** | Auth Flows (UI) | Medium | High | Pending |
| ~~P0~~ | ~~Stripe Integration~~ | ~~High~~ | ~~High~~ | **OURS IS BETTER** |
| **P1** | Admin Dashboard | Medium | High | Pending |
| **P1** | Landing Page Templates | Low | High | Pending |
| **P1** | Email Service | Low | Medium | Pending |
| **P2** | Analytics Integration | Low | Medium | Pending |
| **P2** | File Upload (S3) | Medium | Medium | Pending |
| **P3** | Cookie Consent | Low | Low | Pending |
| **P3** | AI Demo App | Medium | Low | Pending |

---

## Stripe Integration Assessment

### Verdict: Keep Ours

**Our implementation is architecturally superior for B2B SaaS.**

| Aspect | Vibe-Starter | OpenSaaS | Winner |
|--------|--------------|----------|--------|
| Billing Model | Organization-based | User-based | **Vibe-Starter** |
| Seat Pricing | Built-in with quantity updates | Not supported | **Vibe-Starter** |
| Role System | 3-tier hierarchy (owner/admin/member) | Binary (user/admin) | **Vibe-Starter** |
| Database Security | RLS policies | Application-level only | **Vibe-Starter** |
| API Version | `2025-11-17.clover` (latest) | Older | **Vibe-Starter** |
| Code Pattern | Const service pattern | Scattered operations | **Vibe-Starter** |
| Multi-provider | Stripe only | Stripe, Lemon Squeezy, Polar | OpenSaaS |
| Credit System | Not implemented | Built-in (usage-based) | OpenSaaS |

### What We Implemented from OpenSaaS

We adopted the **UI patterns** (not the backend code):

- **Pricing Page** (`/pricing`) - Plan display with interval toggle
- **Billing Page** (`/billing`) - Subscription management with checkout result handling
- **Pricing Components** - PricingCard, PricingTable

### Files Added

```
src/lib/stripe/plans.ts           # Plan configuration
src/components/pricing/
├── PricingCard.tsx               # Individual plan card
├── PricingTable.tsx              # Full pricing display with toggle
└── index.ts                      # Barrel export
src/app/(marketing)/pricing/page.tsx   # Public pricing page
src/app/(app)/billing/
├── page.tsx                      # Billing dashboard
└── BillingActions.tsx            # Portal button
```

### What We Kept From Our Original

```
src/lib/stripe/
├── client.ts                     # Stripe SDK setup
├── types.ts                      # Type definitions
├── stripe-service.ts             # StripeService const
├── webhook.ts                    # WebhookHandler
└── index.ts                      # Barrel exports
src/app/api/stripe/
├── checkout/route.ts             # Create checkout session
├── portal/route.ts               # Create portal session
└── webhook/route.ts              # Handle webhooks
src/lib/middleware/
├── auth.ts                       # requireAuth
├── subscription.ts               # requireOrg, requireSubscription
└── roles.ts                      # requireRole
```

### Optional Future Additions

If needed later:
- **Credit System** - For AI/usage-based features
- **Lemon Squeezy** - For EU market (Merchant of Record)

---

## Feature Deep Dives

### 1. Authentication System

**What OpenSaaS Has:**
- Email/password with verification flow
- Social auth: Google, GitHub, Discord OAuth
- Session management (automatic)
- Pre-built auth UI components
- Admin role system (`isAdmin` flag)

**What We Have:**
- Supabase Auth configured (client/server)
- No pre-built auth UI pages

**Recommendation:**
```
Add to Vibe-Starter:
├── src/app/(auth)/
│   ├── login/page.tsx           # Email + social login
│   ├── signup/page.tsx          # Registration with email verification
│   ├── forgot-password/page.tsx # Password reset flow
│   ├── reset-password/page.tsx  # Token-based reset
│   └── verify-email/page.tsx    # Email confirmation
├── src/components/auth/
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── SocialAuthButtons.tsx    # Google, GitHub, Discord
│   └── AuthCard.tsx             # Shared layout wrapper
└── src/lib/auth/
    └── guards.ts                # Auth middleware helpers
```

**Supabase Advantage:** We get email verification, password reset, and social auth for free - just need UI.

---

### 2. Admin Dashboard

**What OpenSaaS Has:**
- Access control via `isAdmin` flag
- Analytics dashboard with:
  - Total revenue + daily breakdown
  - Page views with daily change %
  - Top referral sources
  - Total users + paying users metrics
- User management:
  - Searchable user list
  - Filter by subscription status
  - Admin privilege management
- Background job for stats aggregation (hourly cron)

**Recommendation:**
```
Add to Vibe-Starter:
├── src/app/(admin)/admin/
│   ├── layout.tsx               # Admin layout + guard
│   ├── page.tsx                 # Dashboard overview
│   ├── users/
│   │   ├── page.tsx             # User list with search/filter
│   │   └── [id]/page.tsx        # User detail/edit
│   └── analytics/page.tsx       # Detailed analytics
├── src/components/admin/
│   ├── StatCard.tsx
│   ├── RevenueChart.tsx
│   ├── UserTable.tsx
│   └── AdminSidebar.tsx
└── src/lib/admin/
    ├── guards.ts                # Admin middleware
    └── stats.ts                 # Stats aggregation queries
```

**Supabase Implementation:**
- Use RLS policy: `auth.jwt() ->> 'is_admin' = 'true'`
- Edge Function for stats aggregation (cron via pg_cron or external)
- Realtime subscriptions for live dashboard updates

---

### 3. Landing Page Templates

**What OpenSaaS Has:**
- Section-based landing page architecture
- Components:
  - Hero section
  - Feature highlights
  - Pricing section
  - Testimonials
  - FAQ section
  - CTA sections
- Logo showcase
- Content sections system

**Recommendation:**
```
Add to Vibe-Starter:
├── src/app/(marketing)/
│   ├── page.tsx                 # Landing page
│   └── about/page.tsx           # About page
├── src/components/landing/
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── FeatureCard.tsx
│   ├── Testimonials.tsx
│   ├── FAQ.tsx
│   ├── CTA.tsx
│   ├── LogoCloud.tsx
│   └── Footer.tsx
└── src/lib/landing/
    └── content.ts               # Content configuration
```

**Note:** Pricing page already implemented at `/pricing`.

---

### 4. Email Service

**What OpenSaaS Has:**
- Provider abstraction (SendGrid, Mailgun, SMTP)
- Simple send API
- Transactional email examples (subscription events)

**What We Have:**
- unosend documented in deps

**Recommendation:**
```
Add to Vibe-Starter:
├── src/lib/email/
│   ├── client.ts                # Email provider setup
│   ├── templates/
│   │   ├── welcome.tsx          # React Email template
│   │   ├── password-reset.tsx
│   │   ├── subscription.tsx
│   │   └── base.tsx             # Base layout
│   └── send.ts                  # Unified send function
└── src/app/api/email/
    └── send/route.ts            # API endpoint (if needed)
```

**Implementation Pattern:**
```typescript
// src/lib/email/send.ts
export const EmailService = {
  async send(options: EmailOptions) {
    // Uses unosend or Resend
  },

  async sendWelcome(user: User) {
    return this.send({
      to: user.email,
      subject: 'Welcome!',
      react: WelcomeEmail({ user })
    })
  },

  async sendPasswordReset(email: string, token: string) {
    // ...
  }
}
```

---

### 5. Analytics Integration

**What OpenSaaS Has:**
- Plausible (privacy-focused, no cookies)
- Google Analytics (with cookie consent)
- Dashboard integration for page views
- Background job fetching analytics data

**Recommendation:**
```
Add to Vibe-Starter:
├── src/lib/analytics/
│   ├── plausible.ts             # Plausible client
│   ├── google.ts                # GA4 client (optional)
│   └── index.ts                 # Unified tracking API
├── src/components/analytics/
│   └── AnalyticsProvider.tsx    # Client-side tracking
└── src/app/api/analytics/
    └── stats/route.ts           # Fetch stats for admin
```

**Environment Variables:**
```env
# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com
PLAUSIBLE_API_KEY=your-api-key

# Optional: Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

### 6. File Upload (S3)

**What OpenSaaS Has:**
- S3 presigned URL pattern
- User-scoped file storage (`user-{id}/`)
- File entity tracking in database
- Download URL generation
- Orphaned file cleanup job

**Recommendation:**
```
Add to Vibe-Starter:
├── src/lib/storage/
│   ├── s3.ts                    # S3 client + presigned URLs
│   ├── supabase-storage.ts      # Alternative: Supabase Storage
│   └── index.ts                 # Unified storage API
├── src/components/upload/
│   ├── FileUpload.tsx           # Drag-drop uploader
│   ├── FileList.tsx             # User's files
│   └── FilePreview.tsx          # Preview component
└── src/app/api/storage/
    ├── upload-url/route.ts      # Get presigned upload URL
    └── download-url/route.ts    # Get presigned download URL
```

**Supabase Alternative:**
Supabase Storage provides similar functionality with simpler setup:
- Built-in presigned URLs
- RLS policies for access control
- No AWS credentials needed
- Transformations for images

---

### 7. Cookie Consent

**What OpenSaaS Has:**
- Banner component (bottom of page)
- Configuration-driven setup
- Granular category controls
- Dynamic script loading based on consent
- Uses `vanilla-cookieconsent` library

**Recommendation:**
```
Add to Vibe-Starter:
├── src/components/cookie-consent/
│   ├── CookieBanner.tsx
│   └── CookieConfig.ts
└── src/lib/cookies/
    └── consent.ts               # Consent state management
```

**Note:** Only needed if using Google Analytics or similar tracking. Plausible doesn't require consent.

---

### 8. AI Demo App

**What OpenSaaS Has:**
- OpenAI integration example
- Function calling demonstration
- Credit-based usage system

**Recommendation:**
```
Add to Vibe-Starter (optional):
├── src/lib/ai/
│   ├── openai.ts                # OpenAI client setup
│   └── anthropic.ts             # Claude integration
├── src/app/(app)/ai-demo/
│   └── page.tsx                 # Demo interface
└── src/components/ai/
    └── ChatInterface.tsx
```

**Lower priority** - can be added per-project as needed.

---

## Implementation Roadmap

### Phase 1: Foundation (P0)
1. ~~**Stripe Integration**~~ - **COMPLETE** (ours is better)
2. **Auth UI Pages** - Login, signup, password reset

### Phase 2: Growth Tools (P1)
3. **Landing Page** - Hero, features, FAQ
4. **Admin Dashboard** - Stats, user management
5. **Email Templates** - Welcome, transactional

### Phase 3: Enhancements (P2)
6. **Analytics** - Plausible integration
7. **File Storage** - Supabase Storage or S3

### Phase 4: Optional (P3)
8. **Cookie Consent** - If using GA
9. **AI Demo** - If relevant to product

---

## Vibe-Starter Advantages to Preserve

While adopting features, maintain these strengths:

1. **Framework Choice** - Keep Next.js AND SvelteKit variants
2. **Supabase-First** - Use Supabase features over external services where possible
3. **Cloudflare Edge** - Maintain edge deployment capability
4. **Simplicity Philosophy** - 簡潔 (simplicity) over feature bloat
5. **Clean Architecture** - const service pattern, clear boundaries
6. **AI-Ready** - Keep CLAUDE.md documentation approach
7. **B2B Architecture** - Organization-based billing (superior to user-based)

---

## Files to Create Summary

```
Remaining Files: ~35-40 files

High Priority (P0-P1):
├── Auth pages (5 pages)
├── Auth components (4 components)
├── Admin dashboard (6 pages)
├── Landing components (8 components)
├── Email service (5 files)
└── Supporting lib files (~8 files)

Medium Priority (P2):
├── Analytics integration (4 files)
└── Storage service (6 files)

Low Priority (P3):
├── Cookie consent (3 files)
└── AI demo (4 files)
```

---

## Decision Points for User

Before implementation, clarify:

1. ~~**Payment Provider**~~: Stripe only (decided - ours is better)
2. **Analytics**: Plausible (simpler, privacy) or Google Analytics?
3. **File Storage**: Supabase Storage (simpler) or AWS S3 (more control)?
4. **Email Provider**: Resend, SendGrid, or stick with unosend?
5. **Which variant first**: Next.js or SvelteKit?

---

## References

- [OpenSaaS Documentation](https://docs.opensaas.sh/)
- [OpenSaaS GitHub](https://github.com/wasp-lang/open-saas)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Stripe Docs](https://stripe.com/docs)
- [Plausible Docs](https://plausible.io/docs)
