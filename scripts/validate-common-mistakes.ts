#!/usr/bin/env tsx
/**
 * Common Mistakes Validator
 *
 * Validates codebase against common anti-patterns from common-mistakes.md:
 * - Relative imports (should use @/ alias)
 * - Forbidden folders (utils/, services/, helpers/, config/)
 * - Type safety shortcuts (as any, @ts-ignore, @ts-expect-error)
 *
 * Usage: pnpm lint:mistakes [--fix]
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname, dirname, basename } from "node:path";

// ─────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────

const EXTENSIONS_TO_CHECK = [".ts", ".tsx", ".svelte", ".js", ".jsx"];

const FORBIDDEN_FOLDERS = [
	"src/utils",
	"src/services",
	"src/helpers",
	"src/config",
];

// Patterns that indicate type safety shortcuts
const TYPE_SAFETY_PATTERNS = [
	{ pattern: /\bas\s+any\b/g, name: "as any" },
	{ pattern: /\/\/\s*@ts-ignore/g, name: "@ts-ignore" },
	{ pattern: /\/\/\s*@ts-expect-error/g, name: "@ts-expect-error" },
	{ pattern: /\/\*\s*@ts-ignore\s*\*\//g, name: "@ts-ignore (block)" },
];

// Relative import pattern - ALL relative imports are forbidden (use @/ alias)
const RELATIVE_IMPORT_PATTERN =
	/(?:import|from)\s+['"](\.\.?\/.+?)['"]/g;

// ─────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────

interface Violation {
	file: string;
	line: number;
	rule: string;
	message: string;
	snippet?: string;
}

interface ValidationResult {
	violations: Violation[];
	filesChecked: number;
	summary: {
		relativeImports: number;
		forbiddenFolders: number;
		typeSafetyShortcuts: number;
	};
}

// ─────────────────────────────────────────────────
// VALIDATORS
// ─────────────────────────────────────────────────

function checkRelativeImports(
	content: string,
	filePath: string,
): Violation[] {
	const violations: Violation[] = [];
	const lines = content.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const matches = line.matchAll(RELATIVE_IMPORT_PATTERN);

		for (const match of matches) {
			const importPath = match[1];
			// Skip CSS/style imports (often need relative for bundlers)
			if (importPath.endsWith(".css") || importPath.endsWith(".scss")) continue;

			violations.push({
				file: filePath,
				line: i + 1,
				rule: "no-relative-imports",
				message: `Use @/ alias instead of relative import "${importPath}"`,
				snippet: line.trim(),
			});
		}
	}

	return violations;
}

function checkTypeSafetyShortcuts(
	content: string,
	filePath: string,
): Violation[] {
	const violations: Violation[] = [];
	const lines = content.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		for (const { pattern, name } of TYPE_SAFETY_PATTERNS) {
			// Reset regex lastIndex for global patterns
			pattern.lastIndex = 0;
			if (pattern.test(line)) {
				violations.push({
					file: filePath,
					line: i + 1,
					rule: "no-type-shortcuts",
					message: `Avoid "${name}" - fix the underlying type issue instead`,
					snippet: line.trim(),
				});
			}
		}
	}

	return violations;
}

function checkForbiddenFolder(filePath: string): Violation | null {
	const relativePath = relative(process.cwd(), filePath);

	for (const forbidden of FORBIDDEN_FOLDERS) {
		if (relativePath.startsWith(forbidden + "/") || relativePath.startsWith(forbidden + "\\")) {
			const correctFolder = forbidden.replace(
				/src\/(utils|services|helpers|config)/,
				"src/lib",
			);
			return {
				file: filePath,
				line: 0,
				rule: "no-forbidden-folders",
				message: `File in forbidden folder "${forbidden}/". Move to "${correctFolder}/" instead`,
			};
		}
	}

	return null;
}

// ─────────────────────────────────────────────────
// FILE DISCOVERY
// ─────────────────────────────────────────────────

function getAllFiles(dir: string): string[] {
	const files: string[] = [];

	function walk(currentDir: string) {
		try {
			const entries = readdirSync(currentDir);
			for (const entry of entries) {
				const fullPath = join(currentDir, entry);
				const stat = statSync(fullPath);

				if (stat.isDirectory()) {
					// Skip non-source directories
					if (
						!entry.startsWith(".") &&
						entry !== "node_modules" &&
						entry !== "build" &&
						entry !== "dist" &&
						entry !== ".output" &&
						entry !== ".svelte-kit"
					) {
						walk(fullPath);
					}
				} else if (EXTENSIONS_TO_CHECK.some((ext) => entry.endsWith(ext))) {
					files.push(fullPath);
				}
			}
		} catch {
			// Skip directories we can't read
		}
	}

	walk(dir);
	return files;
}

// ─────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────

function validateFile(filePath: string): Violation[] {
	const violations: Violation[] = [];

	// Check forbidden folder
	const folderViolation = checkForbiddenFolder(filePath);
	if (folderViolation) {
		violations.push(folderViolation);
	}

	// Read and check content
	const content = readFileSync(filePath, "utf-8");

	// Check relative imports
	violations.push(...checkRelativeImports(content, filePath));

	// Check type safety shortcuts
	violations.push(...checkTypeSafetyShortcuts(content, filePath));

	return violations;
}

function main() {
	const srcDir = join(process.cwd(), "src");
	const files = getAllFiles(srcDir);

	console.log(`\n🔍 Checking ${files.length} files for common mistakes...\n`);

	const result: ValidationResult = {
		violations: [],
		filesChecked: files.length,
		summary: {
			relativeImports: 0,
			forbiddenFolders: 0,
			typeSafetyShortcuts: 0,
		},
	};

	for (const file of files) {
		const violations = validateFile(file);
		result.violations.push(...violations);

		// Update summary
		for (const v of violations) {
			if (v.rule === "no-relative-imports") result.summary.relativeImports++;
			if (v.rule === "no-forbidden-folders") result.summary.forbiddenFolders++;
			if (v.rule === "no-type-shortcuts") result.summary.typeSafetyShortcuts++;
		}
	}

	// Group violations by file
	const byFile = new Map<string, Violation[]>();
	for (const v of result.violations) {
		const relativePath = relative(process.cwd(), v.file);
		if (!byFile.has(relativePath)) {
			byFile.set(relativePath, []);
		}
		byFile.get(relativePath)!.push(v);
	}

	// Print violations
	if (byFile.size > 0) {
		console.log("❌ Common mistakes found:\n");

		for (const [file, violations] of byFile) {
			console.log(`  ${file}`);
			for (const v of violations) {
				const lineInfo = v.line > 0 ? `:${v.line}` : "";
				console.log(`    ⚠️  [${v.rule}] ${v.message}`);
				if (v.snippet) {
					console.log(`       ${v.snippet.substring(0, 80)}${v.snippet.length > 80 ? "..." : ""}`);
				}
			}
			console.log();
		}
	}

	// Summary
	console.log("─".repeat(50));
	console.log(`Files checked: ${result.filesChecked}`);
	console.log(`\nViolations by type:`);
	console.log(`  📦 Relative imports: ${result.summary.relativeImports}`);
	console.log(`  📁 Forbidden folders: ${result.summary.forbiddenFolders}`);
	console.log(`  🔧 Type shortcuts: ${result.summary.typeSafetyShortcuts}`);
	console.log(`\nTotal violations: ${result.violations.length}`);

	if (result.violations.length > 0) {
		console.log(`\n💡 Fix these issues to follow project conventions.`);
		console.log(`   See .claude/common-mistakes.md for details.\n`);
		process.exit(1);
	}

	console.log(`\n✅ No common mistakes found! 🎉\n`);
}

main();
