# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

**Philosophy**: 簡潔 (simplicity) • 純粋 (purity) • 効率 (efficiency)

**Critical Rules**:
- NEVER run `pnpm dev` or `pnpm build` (user only)
- Use `pnpm exec tsc --noEmit` for type checking
- Read `common-mistakes.md` before coding
- Delete unused code immediately
- Use `src/lib/` for all utilities (never `src/utils/`, `src/services/`, etc.)

## Documentation Tree

```
.claude/
├── common-mistakes.md        # ⚠️ READ FIRST - anti-patterns to avoid
├── docs/
│   ├── coding-principles.md  # Japanese coding philosophy
│   ├── patterns.md           # Const service pattern, data flow
│   ├── commands.md           # Development commands & workflow
│   ├── file-conventions.md   # Types, imports, folder rules
│   └── environment.md        # Env vars
├── context/
│   ├── product.md            # Product vision & goals
│   ├── tech.md               # Technical architecture
│   └── structure.md          # Project structure patterns
├── features/                 # Feature specifications (one .md per feature)
└── deps/                     # Dependency documentation
    ├── supabase.md           # Supabase integration
    ├── convex.md             # Convex integration
    ├── stripe.md             # Stripe payments & subscriptions
    └── unosend.md            # Email service (SMTP)
```

## When to Read What

| Task | Read |
|------|------|
| Starting any task | `common-mistakes.md` |
| Writing new code | `docs/coding-principles.md`, `docs/patterns.md` |
| Creating files/folders | `docs/file-conventions.md` |
| Running commands | `docs/commands.md` |
| Setting up env | `docs/environment.md` |
| Understanding architecture | `context/tech.md`, `context/structure.md` |
| Product context | `context/product.md` |
| Using Supabase | `deps/supabase.md` |
| Using Convex | `deps/convex.md` |
| Stripe payments | `deps/stripe.md` |

## Tech Stack

**Core**: Next.js 16 or SvelteKit 2 + TypeScript 5.x + TailwindCSS 4.x
**Database**: Supabase (PostgreSQL) OR Convex (Document DB)
**Auth**: Email OTP (both backends)
**UI**: shadcn/ui (Next.js) or bits-ui (SvelteKit)
**Linting/Formatting**: Biome
**Testing**: Vitest + Playwright (E2E)
**Package Manager**: PNPM 10.x
**Node**: >= 22.0.0

## Commands

```bash
# Type checking (use instead of build)
pnpm exec tsc --noEmit

# Testing
pnpm test              # Watch mode
pnpm test:run          # CI mode (single run)
pnpm test:e2e          # Playwright E2E

# Code quality
pnpm lint              # Check with Biome
pnpm lint:fix          # Auto-fix
pnpm format            # Format with Biome
pnpm format:check      # Check formatting
```

## Project Structure

```
vibe-starter/
├── .claude/              # AI documentation
├── .mcp.json             # MCP server config (Convex)
├── .env.example.supabase # Supabase env template
├── .env.example.convex   # Convex env template
├── setup.sh              # 4-variant setup script
├── nextjs/
│   ├── supabase/         # Next.js + Supabase
│   └── convex/           # Next.js + Convex
└── sveltekit/
    ├── supabase/         # SvelteKit + Supabase
    └── convex/           # SvelteKit + Convex
```

Each variant follows:
```
src/
├── app/              # Routes (Next.js) or routes/ (SvelteKit)
├── components/
│   ├── ui/           # Reusable UI components
│   └── [feature]/    # Feature-specific components
├── lib/              # ALL utilities here
│   ├── supabase/     # Supabase clients (supabase variants)
│   ├── convex/       # Convex client (convex variants)
│   ├── stripe/       # Stripe service & webhooks
│   ├── email/        # Email templates & client
│   └── utils.ts      # General utilities
├── hooks/            # Custom hooks
└── types/            # TypeScript definitions
```

---

**The best code is the simplest code that works correctly.**
