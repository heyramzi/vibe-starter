# Technical Architecture

## Tech Stack

### Core Framework
- **Framework**: Next.js 16+ / SvelteKit 2+
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: TailwindCSS 4.x
- **Package Manager**: PNPM 10.x
- **Node Version**: >= 22.0.0

### Database & Auth
- **Database**: Supabase (PostgreSQL) OR Convex (Document DB)
- **Auth**: Email OTP (Supabase Auth or Convex Auth)
- **ORM**: Supabase Client / Convex Client (no additional ORM)

### UI Components
- **Next.js**: shadcn/ui + Radix UI primitives
- **SvelteKit**: bits-ui or custom components

### Testing
- **Unit**: Vitest
- **Component**: @testing-library/react or @testing-library/svelte
- **E2E**: Playwright (optional)

### Code Quality
- **Linting & Formatting**: Biome
- **Type Checking**: TypeScript strict mode

## Architecture Decisions

### Server-First Approach
- Prefer Server Components/load functions for data fetching
- Use client components only when necessary (interactivity, hooks)
- API routes for mutations and external integrations

### State Management
- Server state via framework data fetching
- Client state: minimal, component-local
- No global state library needed for most apps

### Backend Integration
- **Supabase**: Separate clients for server/client contexts, `@supabase/ssr` for sessions, RLS for authorization
- **Convex**: TypeScript functions for queries/mutations, `@convex-dev/auth` for auth, reactive queries built-in

### File Organization
- Feature-based organization within `src/lib/`
- Colocate tests with source files
- Barrel exports for clean imports

## Security Considerations

- Environment variables for secrets
- Server-side validation with Zod
- CSRF protection via framework
- Content Security Policy headers
- Rate limiting on API routes

## Performance Guidelines

- Minimize client-side JavaScript
- Lazy load non-critical components
- Optimize images with framework tools
- Use edge functions where appropriate

---

_Update when architecture decisions change_
