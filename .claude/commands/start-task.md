# Start Task: $ARGUMENTS

Begin work on a specific feature from the features directory.

## Usage

`/start-task {feature-name}`

## What It Does

1. Loads the feature specification from `.claude/features/{feature-name}/`
2. Reviews requirements.md, design.md, and tasks.md
3. Creates TodoWrite items from tasks.md
4. Begins implementation following the plan

## Example

`/start-task user-authentication`

Loads:
- `.claude/features/user-authentication/requirements.md`
- `.claude/features/user-authentication/design.md`
- `.claude/features/user-authentication/tasks.md`

---

## Workflow

### 1. Read Specifications

Load and review all three spec files:
- **requirements.md** - Understand what we're building and why
- **design.md** - Understand how it should be architected
- **tasks.md** - Understand the implementation order

### 2. Review Project Context

Check relevant project documentation:
- `common-mistakes.md` - Anti-patterns to avoid
- `docs/patterns.md` - Project-specific patterns
- `docs/file-conventions.md` - Where to put files

### 3. Create TodoWrite Items

Convert tasks.md into TodoWrite items:
```
[ ] Phase 1: Task 1
[ ] Phase 1: Task 2
[ ] Phase 2: Task 3
...
```

### 4. Begin Implementation

For each task:
1. Mark task as `in_progress`
2. Implement following design.md
3. Verify with type check
4. Mark task as `completed`
5. Move to next task

### 5. Verify After Each Task

```bash
# Type check (Next.js)
pnpm exec tsc --noEmit

# Type check (SvelteKit)
pnpm check

# Tests (if applicable)
pnpm test:run
```

---

## Skills to Use

During implementation, use relevant skills:

| Situation | Skill |
|-----------|-------|
| Approach unclear | `ux-design` for UI decisions |
| New functionality | `unit-testing` for TDD |
| Code feels messy | `code-refactoring` for cleanup |

---

## If Feature Doesn't Exist

If `.claude/features/{feature-name}/` doesn't exist:

1. Inform the user the feature spec is missing
2. Suggest using `/add-feature {feature-name}` to create it
3. Do not proceed without a spec

---

## Output

After loading the feature:

1. Summarize the feature (2-3 sentences from requirements)
2. List the tasks from tasks.md
3. Ask user to confirm before starting implementation
