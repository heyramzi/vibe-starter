# Technical Architecture

## Tech Stack

### Core Framework
- **Framework**: Next.js 15+ / SvelteKit 2+
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: TailwindCSS 4.x
- **Package Manager**: PNPM 10.x
- **Node Version**: >= 22.0.0

### Database & Auth
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **ORM**: Supabase Client (no additional ORM)

### UI Components
- **Next.js**: shadcn/ui + Radix UI primitives
- **SvelteKit**: bits-ui or custom components

### Testing
- **Unit**: Vitest
- **Component**: @testing-library/react or @testing-library/svelte
- **E2E**: Playwright (optional)

### Code Quality
- **Linting**: ESLint 9+ (flat config)
- **Formatting**: Prettier
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

### Supabase Integration
- Separate clients for server/client contexts
- Use `@supabase/ssr` for session management
- Row Level Security (RLS) for authorization

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
