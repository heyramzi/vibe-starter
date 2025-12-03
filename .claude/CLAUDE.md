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
│   └── environment.md        # Env vars, Supabase keys
├── steering/
│   ├── product.md            # Product vision & goals
│   ├── tech.md               # Technical architecture
│   └── structure.md          # Project structure patterns
├── features/                 # Feature specifications (one .md per feature)
└── deps/                     # Dependency documentation
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

## Tech Stack

**Core**: Next.js 16 or SvelteKit 2 + TypeScript 5.x + TailwindCSS 4.x
**Database**: Supabase (PostgreSQL)
**Package Manager**: PNPM 10.x
**Node**: >= 22.0.0

## Project Structure

```
vibe-starter/
├── .claude/          # AI documentation (shared)
├── .env.example      # Environment template
├── nextjs/           # Next.js variant
└── sveltekit/        # SvelteKit variant
```

Each variant follows:
```
src/
├── app/              # Routes (Next.js) or routes/ (SvelteKit)
├── components/
│   ├── ui/           # Reusable UI components
│   └── [feature]/    # Feature-specific components
├── lib/              # ALL utilities here
│   ├── supabase/     # Supabase clients
│   └── utils.ts      # General utilities
├── hooks/            # Custom hooks
└── types/            # TypeScript definitions
```

---

**The best code is the simplest code that works correctly.**
