# Development Commands

**CRITICAL**: Never run `pnpm dev` or `pnpm build` - these are user-only commands.

## Available Commands

```bash
# Type checking (use this instead of build)
pnpm exec tsc --noEmit

# Testing
pnpm test              # Watch mode
pnpm test:run          # CI mode

# Code quality
pnpm lint              # Check
pnpm lint:fix          # Auto-fix
pnpm format            # Format with Biome
pnpm format:check      # Check formatting
```

## Development Workflow

### Before Coding
1. Read `.claude/common-mistakes.md`
2. Read existing code to understand patterns
3. Check `src/lib/` structure before creating folders
4. Use existing utilities before creating new ones

### During Coding
1. Never over-engineer
2. Match existing patterns
3. One change at a time
4. Refactor proactively

### After Coding
1. Remove unused imports/code
2. Ensure TypeScript compliance
3. Test the specific change
