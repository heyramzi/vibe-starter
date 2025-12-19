---
name: file-reorganizer
description: Use when codebase structure drifts from conventions, files land in wrong folders, or need to split/merge files - maintains clean organization without over-engineering.
---

# File Reorganizer

**Philosophy**: 整理整頓 (Seiri Seiton) - Sort and set in order.

A place for everything, everything in its place. Disorder spreads silently.

---

## The Balance

```
SPAGHETTI ←――――――――――→ OVER-ENGINEERING
(tangled mess)    ✓    (abstraction hell)
                 YOU
```

**Spaghetti signs:**
- 500+ line files doing everything
- Utilities scattered across random folders
- "Where does this go?" → "Anywhere, I guess"

**Over-engineering signs:**
- Folder created for one file
- Helper function used exactly once
- "Let me create a utils layer for this"

---

## When to Use

**Trigger conditions:**
- Before creating a PR (proactive check)
- After completing a large feature
- Codebase feels disorganized
- New files were added hastily during debugging
- Part of `/cleanup` orchestrator workflow

**Not for:**
- Adding new features
- Bug fixes
- Single file cleanup (use `code-refactoring` skill)

---

## Operations

| Operation | When | Threshold |
|-----------|------|-----------|
| **Move** | File in wrong folder | Always fix |
| **Split** | File too large with multiple concerns | 300+ lines |
| **Merge** | Tiny scattered related files | <30 lines each |

---

## Framework-Specific Structure

### SvelteKit

```
src/
├── lib/                    # Shared code ($lib alias)
│   ├── components/         # Svelte components
│   │   ├── ui/             # shadcn-svelte primitives
│   │   └── {domain}/       # Feature components
│   ├── server/             # Server-only code
│   │   └── {service}/      # External services
│   └── {domain}/           # Domain utilities
│       ├── index.ts        # Barrel export
│       ├── client.ts       # Main logic
│       └── types.ts        # Domain types
├── routes/                 # SvelteKit routes
│   ├── +page.svelte
│   ├── +page.server.ts
│   └── +layout.svelte
└── app.html
```

**Import Alias:** `$lib/`

**Forbidden Folders:**
- `src/utils/` → Use `src/lib/`
- `src/services/` → Use `src/lib/server/`
- `src/helpers/` → Use `src/lib/`

### Next.js (App Router)

```
src/
├── app/                    # App Router routes
│   ├── (app)/              # Authenticated routes
│   ├── (public)/           # Public routes
│   ├── api/                # API routes
│   ├── layout.tsx
│   └── page.tsx
├── components/             # React components
│   ├── ui/                 # shadcn/ui primitives
│   └── {domain}/           # Feature components
├── lib/                    # Shared utilities
│   ├── supabase/           # Supabase clients
│   └── {domain}/           # Domain utilities
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript types
```

**Import Alias:** `@/`

**Forbidden Folders:**
- `src/utils/` → Use `src/lib/`
- `src/services/` → Use `src/lib/`
- `pages/` → Use `app/` (App Router)

---

## Execution Flow

### Proactive Mode (Pre-PR)

```
1. SCAN      → Quick check against structure
2. REPORT    → List violations without fixing
3. CONFIRM   → User decides what to address
4. FIX       → Apply approved changes
5. VERIFY    → Type check passes
```

### Reactive Mode (Full Cleanup)

```
1. AUDIT     → Deep scan of codebase
2. CATALOG   → Create TodoWrite items for ALL issues
3. PRIORITIZE → Order: wrong folders → splits → merges
4. EXECUTE   → One change at a time
5. VERIFY    → Full verification
```

---

## Recipes

### Recipe: Move File

```bash
# 1. Move the file
git mv src/utils/format.ts src/lib/format/index.ts

# 2. Update all imports
# Search for old path, replace with new

# 3. Type check
pnpm check  # or pnpm exec tsc --noEmit

# 4. Delete empty source folder
rmdir src/utils/  # Only if empty
```

### Recipe: Split Bloated File

```typescript
// BEFORE: src/lib/pricing/calculator.ts (400 lines)
// - Price calculation
// - Discount rules
// - Formatting utilities

// AFTER: Split by concern
src/lib/pricing/
├── index.ts        # Barrel export
├── calculator.ts   # Core calculation (150 lines)
├── rules.ts        # Discount rules (100 lines)
└── format.ts       # Formatting (50 lines)
```

### Recipe: Merge Fragmented Files

```typescript
// BEFORE: Scattered tiny files
src/lib/format/
├── date.ts         # 15 lines
├── time.ts         # 10 lines
├── currency.ts     # 20 lines

// AFTER: Consolidated
src/lib/format/
└── index.ts        # 45 lines - single cohesive module
```

---

## Red Flags - STOP

If you catch yourself thinking:
- "Let me create a folder for this one file" → NO. Wait for 3+ files.
- "This 150-line file should be split" → NO. It's fine.
- "I'll create a helpers/ subfolder" → NO. Use flat structure.
- "Let me add an abstraction layer" → NO. Just move files.

---

## Verification Checklist

**Structure:**
- [ ] No files in forbidden folders (`utils/`, `services/`, `helpers/`)
- [ ] All utilities in `src/lib/`
- [ ] Feature folders follow consistent patterns

**Imports:**
- [ ] All imports use correct alias (`$lib/` or `@/`)
- [ ] No broken imports (type check passes)

**Balance:**
- [ ] No single-file folders created
- [ ] No files under 30 lines (unless truly standalone)
- [ ] No unnecessary abstractions added

**Commands:**
```bash
# Type check
pnpm check  # SvelteKit
pnpm exec tsc --noEmit  # Next.js

# Search for forbidden folders
ls src/utils src/services src/helpers 2>/dev/null && echo "FAIL"

# Search for relative imports in lib
grep -rn "from '\.\." src/lib/ --include="*.ts"
```

---

**Remember**: Organization serves the code, not the other way around.

形より心 - "Spirit over form"
