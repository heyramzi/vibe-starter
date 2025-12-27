# Vibe Starter - SvelteKit

SvelteKit 2 starter with Svelte 5, Supabase, TailwindCSS 4, and TypeScript.

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp ../.env.example .env
   # Edit .env with your Supabase credentials
   # Use PUBLIC_ prefix for SvelteKit (not NEXT_PUBLIC_)
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5 (Runes)
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: TailwindCSS 4.1
- **Database**: Supabase
- **UI Components**: bits-ui
- **Testing**: Vitest
- **Package Manager**: PNPM 10

## Project Structure

```
src/
├── routes/                 # SvelteKit file-based routing
├── lib/
│   ├── components/ui/      # UI components (bits-ui based)
│   ├── supabase/           # Supabase client
│   ├── schemas/            # Zod validation schemas
│   └── utils.ts            # Utilities (cn helper)
├── types/                  # Shared TypeScript types
├── app.css                 # Global styles
├── app.html                # HTML template
├── app.d.ts                # Type declarations
└── hooks.server.ts         # Server hooks (Supabase setup)
```

## Svelte 5 Runes

This project uses Svelte 5's new reactivity system:

```svelte
<script lang="ts">
  // Reactive state
  let count = $state(0)

  // Derived values
  let doubled = $derived(count * 2)

  // Side effects
  $effect(() => {
    console.log(`Count: ${count}`)
  })

  // Props
  let { name } = $props<{ name: string }>()
</script>
```

## Commands

```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm preview       # Preview production build
pnpm check         # Type-check
pnpm test          # Run tests
pnpm lint          # Lint code
pnpm format        # Format code
```

## Documentation

See `../.claude/CLAUDE.md` for development guidelines and patterns.
