# Vibe Starter - Next.js

Next.js 16 starter with Supabase, TailwindCSS 4, and TypeScript.

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp ../.env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: TailwindCSS 4.1
- **Database**: Supabase
- **UI Components**: shadcn/ui (install via `pnpm dlx shadcn@latest add [component]`)
- **Testing**: Vitest + React Testing Library
- **Package Manager**: PNPM 10

## Project Structure

```
src/
├── app/                    # Next.js app router
├── components/
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── supabase/           # Supabase clients
│   ├── schemas/            # Zod validation schemas
│   └── utils.ts            # Utilities (cn helper)
├── hooks/                  # Custom React hooks
├── types/                  # Shared TypeScript types
├── styles/                 # Global styles
└── test/                   # Test setup
```

## Commands

```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm test          # Run tests in watch mode
pnpm test:run      # Run tests once
pnpm lint          # Lint code
pnpm format        # Format code
```

## Adding shadcn/ui Components

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add dialog
```

## Documentation

See `../.claude/CLAUDE.md` for development guidelines and patterns.
