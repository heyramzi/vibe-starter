# Standard Commands

Commands are user invocation points that trigger workflows. They're thin wrappers that reference skills for methodology.

## Structure

```
commands/
├── README.md           # This file
├── refactor.md         # Invoke code-refactoring skill
├── add-feature.md      # Create feature scaffolding
├── start-task.md       # Begin work on feature spec
├── write-tests.md      # Invoke unit-testing skill
└── cleanup.md          # ORCHESTRATOR: audit → reorganize → refactor → verify
```

## Standard Commands (5)

| Command | Purpose | Invokes Skill |
|---------|---------|---------------|
| `/refactor {target}` | Code cleanup and simplification | `code-refactoring.md` |
| `/add-feature {name}` | Create `.claude/features/{name}/` scaffolding | None |
| `/start-task {name}` | Load feature spec and begin implementation | None |
| `/write-tests {target}` | Write unit tests for target file | `unit-testing.md` |
| `/cleanup {target}` | **Orchestrator** - Full cleanup workflow | Multiple |

## Workflow Commands

### /cleanup (Orchestrator)

Sequences multiple skills for comprehensive cleanup:
```
1. AUDIT      → ui-audit.md
2. REORGANIZE → file-reorganizer.md
3. REFACTOR   → code-refactoring.md
4. VERIFY     → Type check + tests
```

### /add-feature + /start-task

Feature development workflow:
```
1. /add-feature {name}  → Create spec scaffolding
2. Fill in specs        → requirements.md, design.md, tasks.md
3. /start-task {name}   → Begin implementation with TodoWrite tracking
```

## For Individual Projects

All 5 commands are framework-agnostic. Copy them directly to any project:

```bash
# Copy all commands
cp -r vibe-starter/.claude/commands/*.md your-project/.claude/commands/
```

## Creating New Commands

Commands should:
- Accept `$ARGUMENTS` for user input
- Reference skills for methodology (don't duplicate)
- Include clear instructions and examples
- List what the command does and doesn't do
