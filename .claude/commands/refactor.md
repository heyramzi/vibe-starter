# Refactor: $ARGUMENTS

Read and follow the refactoring skill at `.claude/skills/code-refactoring/SKILL.md`.

## Target
$ARGUMENTS

## Instructions

1. **Analyze**: Read the target file(s) or feature area specified above
2. **Check conventions**: Review against `common-mistakes.md` and `coding-principles.md`
3. **List issues**: Identify specific violations and improvement opportunities
4. **Plan**: Propose specific changes, ordered by impact
5. **Execute**: Make atomic changes, verifying each with type checking
6. **Cleanup**: Remove unused code, verify no regressions

Focus on:
- Simplification over cleverness
- Alignment with project patterns
- Removing redundancy
- Deleting unused code

Do NOT:
- Add new features
- Create new abstractions without 3+ use cases
- Add backward compatibility layers
- Skip type checking between changes
