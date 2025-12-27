# CLAUDE.md

AI agent instructions for vibe-starter. Read relevant docs below based on your task.

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
├── CLAUDE.md                 # This file - start here
├── common-mistakes.md        # ⚠️ READ FIRST - anti-patterns to avoid
├── docs/
│   ├── coding-principles.md  # Japanese coding philosophy
│   ├── patterns.md           # Const service pattern, data flow
│   ├── commands.md           # Development commands & workflow
│   ├── file-conventions.md   # Types, imports, folder rules
│   └── environment.md        # Env vars
├── steering/
│   ├── product.md            # Product vision & goals
│   ├── tech.md               # Technical architecture
│   └── structure.md          # Project structure patterns
├── features/                 # Feature specifications (one .md per feature)
└── deps/                     # Dependency documentation
    ├── supabase.md           # Supabase integration
    ├── convex.md             # Convex integration
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
| Understanding architecture | `steering/tech.md`, `steering/structure.md` |
| Product context | `steering/product.md` |
| Using Supabase | `deps/supabase.md` |
| Using Convex | `deps/convex.md` |

## Tech Stack

**Core**: Next.js 16 or SvelteKit 2 + TypeScript 5.x + TailwindCSS 4.x
**Database**: Supabase (PostgreSQL) OR Convex (Document DB)
**Auth**: Email OTP (both backends)
**Package Manager**: PNPM 10.x
**Node**: >= 22.0.0

## Project Structure

```
vibe-starter/
├── .claude/              # AI documentation (shared)
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
│   └── utils.ts      # General utilities
├── hooks/            # Custom hooks
└── types/            # TypeScript definitions
```

---

**The best code is the simplest code that works correctly.**
