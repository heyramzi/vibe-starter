# Vibe Starter - SvelteKit + Supabase

SvelteKit 2 starter with Svelte 5, Supabase, TailwindCSS 4, and TypeScript.

## Getting Started

```bash
pnpm install
cp ../../.env.example.supabase .env
# Edit .env with your Supabase credentials
pnpm dev
```

## Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5 (Runes)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase OTP (passwordless)
- **Payments**: Stripe (direct SDK)
- **Styling**: TailwindCSS 4
- **UI**: bits-ui

## Auth (OTP)

```typescript
import { SupabaseAuth } from "$lib/supabase"

// Send OTP
await SupabaseAuth.sendOTP("user@example.com")

// Verify OTP
await SupabaseAuth.verifyOTP("user@example.com", "123456")

// Sign out
await SupabaseAuth.signOut()
```

## Svelte 5 Runes

```svelte
<script lang="ts">
  let count = $state(0)
  let doubled = $derived(count * 2)

  $effect(() => {
    console.log(`Count: ${count}`)
  })
</script>
```

## Project Structure

```
src/
├── routes/                 # SvelteKit file-based routing
├── lib/
│   ├── components/ui/      # UI components (bits-ui)
│   ├── supabase/           # Supabase client + auth
│   └── utils.ts            # Utilities
├── app.d.ts                # Type declarations
└── hooks.server.ts         # Server hooks
```

## Commands

```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm check         # Type-check
pnpm test:run      # Run tests
```

## Documentation

See `../../CLAUDE.md` for development guidelines.
