# Cleanup: $ARGUMENTS

**Orchestrator command** - Comprehensive codebase cleanup combining audit, reorganization, and refactoring.

## Target
$ARGUMENTS (file, folder, feature, or "full" for entire codebase)

## Workflow

Execute these phases in order. Each phase must complete before the next begins.

### Phase 1: AUDIT
**Skill**: `ui-audit.md`

1. Scan target for violations:
   - Layout issues
   - Missing states (empty/loading/error)
   - Component violations
   - Typography/color/spacing issues
   - Framework-specific anti-patterns

2. Create TodoWrite items for each issue found
3. Categorize by severity: Critical → Major → Minor

**Output**: Audit report with prioritized issues

---

### Phase 2: REORGANIZE
**Skill**: `file-reorganizer.md`

1. Check file locations against project structure:
   - Files in wrong folders?
   - Bloated files needing split? (300+ lines, multiple concerns)
   - Fragmented files needing merge?

2. Fix structure issues:
   - Move misplaced files
   - Split/merge as needed
   - Update all imports

3. Type check after each move

**Output**: Clean file structure

---

### Phase 3: REFACTOR
**Skill**: `code-refactoring.md`

1. Address audit findings:
   - Fix critical issues first
   - Then major, then minor

2. Clean legacy patterns:
   - Remove redundant fallbacks
   - Delete backward compatibility shims
   - Fix type assertions
   - Migrate old framework patterns (Svelte 4→5, etc.)

3. Simplify code:
   - Extract duplicates
   - Flatten nested conditionals
   - Apply const service pattern
   - Delete unused code

4. Type check after each change

**Output**: Clean, modern code

---

### Phase 4: VERIFY

Run all verification steps:

```bash
# Type check (choose based on framework)
pnpm exec tsc --noEmit   # Next.js
pnpm check               # SvelteKit

# Tests (if applicable)
pnpm test:run

# Search for remaining issues
grep -rn "TODO" src/
grep -rn "as any" src/
grep -rn "export let" src/  # Svelte 4 pattern
```

**Output**: All checks pass, no remaining issues

---

## Quick Reference

| Phase | Skill | Focus |
|-------|-------|-------|
| Audit | ui-audit.md | Find issues |
| Reorganize | file-reorganizer.md | Fix structure |
| Refactor | code-refactoring.md | Fix code |
| Verify | - | Confirm clean |

## Usage Examples

```bash
# Full codebase cleanup
/cleanup full

# Single feature
/cleanup src/routes/dashboard

# Single file
/cleanup src/lib/utils/format.ts

# After completing a feature
/cleanup src/routes/portals
```

## When to Use

- Before creating a PR
- After completing a large feature
- Monthly maintenance
- When codebase feels messy
- Before major releases

## Do NOT Use For

- Bug fixes (fix the bug first, then cleanup)
- Adding new features (use add-feature + start-task)
- Quick one-file changes (use /refactor instead)

---

**Remember**: Cleanup is investment. Technical debt compounds daily.

整理整頓 - "Sort and set in order"
