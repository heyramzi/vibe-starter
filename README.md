# Vibe Starter

Production-ready starter templates with your choice of backend. Pick your framework and database, then start building.

## Quick Start

```bash
git clone <repo> my-project
cd my-project
./setup.sh <variant>
pnpm install
pnpm dev
```

## Variants

| Command | Framework | Backend | Auth |
|---------|-----------|---------|------|
| `./setup.sh nextjs-supabase` | Next.js 16 | Supabase | Email OTP |
| `./setup.sh nextjs-convex` | Next.js 16 | Convex | Email OTP |
| `./setup.sh sveltekit-supabase` | SvelteKit 2 | Supabase | Email OTP |
| `./setup.sh sveltekit-convex` | SvelteKit 2 | Convex | Email OTP |

## Features

- **Japanese Coding Principles**: 簡潔 (simplicity), 純粋 (purity), 効率 (efficiency)
- **Const Service Pattern**: Organized, discoverable code with IDE autocomplete
- **Email OTP Auth**: Passwordless authentication out of the box
- **Stripe Integration**: Payments ready (direct SDK for Supabase, component for Convex)
- **TailwindCSS 4**: Latest version with CSS-first configuration
- **TypeScript Strict**: Full type safety
- **AI-Optimized**: `.claude/` documentation for Claude Code

## Backend Comparison

| Feature | Supabase | Convex |
|---------|----------|--------|
| Database | PostgreSQL | Document DB |
| Real-time | Realtime subscriptions | Built-in reactive queries |
| Auth | Supabase Auth (OTP) | Convex Auth (OTP) |
| Stripe | Direct SDK | @convex-dev/stripe component |
| Query Language | SQL | TypeScript functions |
| Self-hosting | Yes | No |

## Project Structure

```
vibe-starter/
├── .claude/              # AI development guidelines
├── .mcp.json             # MCP server configuration (Convex)
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

## Documentation

Read `CLAUDE.md` for AI agent instructions and `.claude/` for detailed development guidelines.

## License

MIT
