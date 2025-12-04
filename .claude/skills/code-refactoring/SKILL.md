---
name: code-refactoring
description: Use when code needs cleanup, simplification, or harmonization with codebase patterns. Identifies redundancies, removes complexity, and ensures adherence to project guidelines.
---

# Code Refactoring

**Philosophy**: 断捨離 (Danshari) - Declutter, simplify, let go of what doesn't serve.

Clean code is not code that has been polished. It's code that has been reduced to its essence.

---

## When to Use

**Trigger conditions:**
- Code feels "messy" or hard to follow
- Similar patterns repeated across files
- Overly complex abstractions for simple tasks
- Code that doesn't follow project conventions
- After a feature is complete but feels bloated
- Before merging significant PRs

**Not for:**
- Adding new features (use brainstorming skill)
- Fixing bugs (fix first, then refactor)
- Premature optimization

---

## Core Pattern

### The Refactoring Mindset

```
BEFORE refactoring, ask:
├─ What is the simplest version of this?
├─ Does this follow project patterns?
├─ Is there duplication to eliminate?
├─ Can I delete anything?
└─ Would a new developer understand this?

AFTER refactoring, verify:
├─ Tests still pass
├─ Type checking passes
├─ No unused code remains
└─ It reads like prose
```

---

## Quick Reference

| Smell | Action |
|-------|--------|
| Duplicate code | Extract to single location in `src/lib/` |
| Nested conditionals | Early returns, guard clauses |
| Long functions | Split into focused units (<10 lines ideal) |
| Complex types | Simplify, use inference where possible |
| Mixed concerns | Separate into distinct files |
| Unclear naming | Rename to reveal intent |
| Unused code | Delete immediately |
| Inconsistent patterns | Align with project conventions |
| Helper sprawl | Consolidate to const service pattern |
| Relative imports | Convert to `@/` absolute imports |

---

## Implementation

### Phase 1: Analyze (Read-Only)

```markdown
1. Read the target file(s) completely
2. Identify violations against project patterns:
   - Check common-mistakes.md
   - Check coding-principles.md
   - Check file-conventions.md
3. List specific issues found
4. Prioritize by impact (high → low)
```

### Phase 2: Plan Refactoring

```markdown
For each issue, determine:
- What code needs to change?
- What pattern should it follow?
- Will this affect other files?
- What's the minimal change needed?
```

### Phase 3: Execute (One Change at a Time)

```markdown
1. Make ONE atomic change
2. Run type check: pnpm exec tsc --noEmit
3. Run tests if applicable
4. Verify change is correct
5. Repeat for next change
```

### Phase 4: Cleanup

```markdown
1. Delete any unused imports
2. Delete any commented-out code
3. Delete any TODO comments that are now done
4. Final type check
5. Verify no regressions
```

---

## Project-Specific Checklist

Based on this codebase's conventions:

### Structure
- [ ] All utilities in `src/lib/` (not `utils/`, `services/`, `helpers/`)
- [ ] Domain folders: `lib/{domain}/types.ts`, `client.ts`, `index.ts`
- [ ] Barrel exports organized by category

### Patterns
- [ ] Const service pattern for related functions
- [ ] Pure functions with no side effects
- [ ] Single responsibility per file/function

### Style
- [ ] `@/` imports only (no relative paths)
- [ ] Single-line comments for "why" not "what"
- [ ] No redundant fallbacks in props
- [ ] No verbose JSDoc for obvious code

### Cleanup
- [ ] No backward compatibility shims
- [ ] No unused exports
- [ ] No dead code paths
- [ ] No empty files or placeholder code

---

## Common Refactoring Recipes

### Recipe: Extract Repeated Logic

```typescript
// BEFORE: Duplication across files
// file1.ts
const user = await supabase.from('users').select().eq('id', id).single()
if (!user.data) throw new Error('User not found')

// file2.ts
const user = await supabase.from('users').select().eq('id', id).single()
if (!user.data) throw new Error('User not found')

// AFTER: Single source in lib
// src/lib/users/client.ts
export const Users = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }
}
```

### Recipe: Flatten Nested Conditionals

```typescript
// BEFORE: Nested nightmare
function process(input: Input | null) {
  if (input) {
    if (input.valid) {
      if (input.data) {
        return transform(input.data)
      }
    }
  }
  return null
}

// AFTER: Guard clauses
function process(input: Input | null) {
  if (!input?.valid || !input.data) return null
  return transform(input.data)
}
```

### Recipe: Const Service Pattern

```typescript
// BEFORE: Scattered exports
export function formatDate(d: Date) { ... }
export function parseDate(s: string) { ... }
export function isValidDate(d: Date) { ... }

// AFTER: Grouped service
export const DateUtils = {
  format(d: Date) { ... },
  parse(s: string) { ... },
  isValid(d: Date) { ... },
}
```

### Recipe: Clean Component Props

```typescript
// BEFORE: Redundant defaults
function Card({ size = 'md' }: Props) {
  const finalSize = size || 'md'  // Redundant!
  return <div className={sizes[finalSize]} />
}

// AFTER: Trust the default
function Card({ size = 'md' }: Props) {
  return <div className={sizes[size]} />
}
```

---

## Common Mistakes During Refactoring

| Mistake | Why It's Wrong | Correct Approach |
|---------|----------------|------------------|
| Adding "compatibility" exports | Creates permanent debt | Delete old, update all refs |
| Refactoring untested code | Can't verify correctness | Add tests first or skip |
| Big-bang refactors | Too risky, hard to review | Small, atomic changes |
| Refactoring during bug fix | Mixes concerns | Fix bug, commit, then refactor |
| Adding comments instead of clarifying | Masks the problem | Rename/restructure to be obvious |
| Creating new abstractions | Usually premature | Wait until 3+ use cases |

---

## Verification

After refactoring, always verify:

```bash
# Type check
pnpm exec tsc --noEmit

# Tests (if applicable)
pnpm test

# Visual check for unused imports/code
# Review diff for any accidental deletions
```

---

**Remember**: The goal is not perfect code. The goal is simpler code.
削除は追加より価値がある - "Deletion is more valuable than addition"
