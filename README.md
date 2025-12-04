# Vibe Starter

Production-ready starter templates with Supabase, TailwindCSS 4, and TypeScript. Choose your framework and start building.

## Features

- **Japanese Coding Principles**: 簡潔 (simplicity), 純粋 (purity), 効率 (efficiency)
- **Const Service Pattern**: Organized, discoverable code with IDE autocomplete
- **Supabase Ready**: Auth and database pre-configured
- **TailwindCSS 4**: Latest version with CSS-first configuration
- **TypeScript Strict**: Full type safety out of the box
- **Testing Setup**: Vitest configured and ready
- **AI-Optimized**: `.claude/` documentation for Claude Code

## Choose Your Framework

### Next.js

```bash
cd nextjs
pnpm install
cp ../.env.example .env.local
pnpm dev
```

**Stack**: Next.js 16 + React 19 + shadcn/ui

### SvelteKit

```bash
cd sveltekit
pnpm install
cp ../.env.example .env
pnpm dev
```

**Stack**: SvelteKit 2 + Svelte 5 (Runes) + bits-ui

## Project Structure

```
vibe-starter/
├── .claude/                # AI development guidelines
│   ├── CLAUDE.md           # Main instructions (READ FIRST)
│   ├── common-mistakes.md  # Anti-patterns to avoid
│   ├── steering/           # Product, tech, structure docs
│   ├── features/           # Feature specifications
│   └── deps/               # Dependency documentation
├── .env.example            # Environment variables template
├── nextjs/                 # Next.js variant
└── sveltekit/              # SvelteKit variant
```

## Documentation

Read `.claude/CLAUDE.md` before starting development. It contains:

- Japanese coding principles
- Const service pattern (核心パターン)
- File organization rules
- Common mistakes to avoid

## Quick Setup

```bash
git clone <repo> my-project
cd my-project
./setup.sh nextjs   # or sveltekit
pnpm install
pnpm dev
```

The setup script removes the other framework, moves files to root, and creates your `.env` file.

## What's Included

### Both Variants
- TailwindCSS 4 with CSS variables for theming
- Supabase SSR clients (server + browser)
- Utility function `cn()` for class merging
- Type-safe environment variables
- ESLint + Prettier configuration
- Vitest testing setup
- Production-ready gitignore

### Next.js Specific
- App Router with layouts
- shadcn/ui compatible (run `pnpm dlx shadcn@latest add [component]`)
- Server Components ready
- Sonner toast notifications

### SvelteKit Specific
- Svelte 5 Runes reactivity
- bits-ui components
- Server hooks for Supabase
- svelte-sonner for toasts

## Package Versions

All dependencies are pinned to latest stable versions (as of December 2025):

- **Node**: >= 22.0.0
- **PNPM**: 10.15.1
- **TypeScript**: 5.9.x
- **TailwindCSS**: 4.1.x
- **Supabase**: Latest SSR packages

## License

MIT
