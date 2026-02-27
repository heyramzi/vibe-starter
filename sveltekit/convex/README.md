# Vibe Starter - SvelteKit + Convex

SvelteKit 2 starter with Svelte 5, Convex, TailwindCSS 4, and TypeScript.

## Getting Started

```bash
pnpm install
npx convex dev  # Initialize Convex project
cp ../../.env.example.convex .env
# Edit .env with your Convex credentials
pnpm dev
```

## Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5 (Runes)
- **Database**: Convex (reactive document DB)
- **Auth**: Convex Auth OTP (passwordless)
- **Payments**: @convex-dev/stripe component
- **Styling**: TailwindCSS 4
- **UI**: bits-ui

## Convex Queries

```svelte
<script lang="ts">
  import { useQuery, useMutation } from "convex-svelte"
  import { api } from "../../convex/_generated/api"

  // Reactive query
  const orgs = useQuery(api.organizations.list, {})

  // Mutation
  const createOrg = useMutation(api.organizations.create)
</script>

{#each $orgs ?? [] as org}
  <p>{org.name}</p>
{/each}
```

## Project Structure

```
src/
├── routes/                 # SvelteKit file-based routing
├── lib/
│   ├── components/ui/      # UI components (bits-ui)
│   ├── convex/             # Convex client
│   └── utils.ts            # Utilities
├── app.d.ts                # Type declarations
└── hooks.server.ts         # Server hooks
convex/
├── schema.ts               # Database schema
├── auth.ts                 # Auth configuration
└── http.ts                 # HTTP routes
```

## Commands

```bash
pnpm dev           # Start development server
npx convex dev     # Start Convex dev server
pnpm build         # Build for production
pnpm check         # Type-check
```

## Documentation

See `../../CLAUDE.md` for development guidelines.
