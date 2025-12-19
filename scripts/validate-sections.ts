#!/usr/bin/env tsx
/**
 * Multi-Framework Section Order Validator
 *
 * Validates that source files follow standard section ordering for each framework:
 *
 * SVELTE:    IMPORTS → TYPES → CONSTANTS → PROPS → STATE → DERIVED → FUNCTIONS → EFFECTS
 * REACT/TSX: IMPORTS → TYPES → CONSTANTS → HOOKS → STATE → HANDLERS → HELPERS → COMPONENT
 * GAS/TS:    IMPORTS → TYPES → CONSTANTS → SERVICE → HELPERS → MAIN
 * SWIFT:     MARK: Properties → Initialization → Public → Private → Actions
 *
 * Usage: pnpm lint:sections [--framework svelte|react|gas|swift] [--fix]
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, extname } from "node:path";

// ─────────────────────────────────────────────────
// FRAMEWORK CONFIGURATIONS
// ─────────────────────────────────────────────────

interface FrameworkConfig {
	name: string;
	extensions: string[];
	sectionOrder: string[];
	sectionPattern: RegExp;
	extractContent: (content: string) => string | null;
	normalizeSection: (section: string) => string;
	commentStyle: "double-slash" | "mark";
}

const FRAMEWORKS: Record<string, FrameworkConfig> = {
	svelte: {
		name: "Svelte",
		extensions: [".svelte"],
		sectionOrder: [
			"IMPORTS",
			"TYPES",
			"CONSTANTS",
			"PROPS",
			"STATE",
			"DERIVED",
			"FUNCTIONS",
			"EFFECTS",
		],
		sectionPattern: /^\/\/\s*([A-Z][A-Z\s]*[A-Z])\s*$/,
		extractContent: (content: string) => {
			const match = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
			return match ? match[1] : null;
		},
		normalizeSection: (section: string) => {
			const upper = section.toUpperCase();
			if (upper.includes("DERIVED")) return "DERIVED";
			if (upper.includes("EFFECT")) return "EFFECTS";
			if (upper.includes("IMPORT")) return "IMPORTS";
			if (upper.includes("FUNCTION")) return "FUNCTIONS";
			if (upper.includes("PROP")) return "PROPS";
			if (upper.includes("STATE")) return "STATE";
			if (upper.includes("TYPE")) return "TYPES";
			if (upper.includes("CONST")) return "CONSTANTS";
			return upper;
		},
		commentStyle: "double-slash",
	},

	react: {
		name: "React/Next.js",
		extensions: [".tsx"],
		sectionOrder: [
			"IMPORTS",
			"TYPES",
			"CONSTANTS",
			"HOOKS",
			"STATE",
			"HANDLERS",
			"HELPERS",
			"COMPONENT",
		],
		sectionPattern: /^\/\/\s*([A-Z][A-Z\s]*[A-Z]?)\s*$/,
		extractContent: (content: string) => content,
		normalizeSection: (section: string) => {
			const upper = section.toUpperCase();
			if (upper.includes("IMPORT")) return "IMPORTS";
			if (upper.includes("TYPE")) return "TYPES";
			if (upper.includes("CONST")) return "CONSTANTS";
			if (upper.includes("HOOK")) return "HOOKS";
			if (upper.includes("STATE")) return "STATE";
			if (upper.includes("HANDLER")) return "HANDLERS";
			if (upper.includes("HELPER")) return "HELPERS";
			// Only match exact "COMPONENT" - ignore sub-components like "STEP CARD COMPONENT"
			if (upper === "COMPONENT") return "COMPONENT";
			if (upper.includes("CONTEXT")) return "HOOKS";
			if (upper === "PROVIDER") return "COMPONENT";
			// Sub-components (X COMPONENT) and other sections are ignored
			return upper;
		},
		commentStyle: "double-slash",
	},

	gas: {
		name: "Google Apps Script",
		extensions: [".ts"],
		sectionOrder: [
			"IMPORTS",
			"TYPES",
			"CONSTANTS",
			"SERVICE",
			"HELPERS",
			"MAIN",
		],
		sectionPattern: /^\/\/\s*([A-Z][A-Z\s]*[A-Z]?)\s*$/,
		extractContent: (content: string) => content,
		normalizeSection: (section: string) => {
			const upper = section.toUpperCase();
			// Only match exact sections, not sub-sections
			if (upper === "IMPORTS" || upper === "IMPORT") return "IMPORTS";
			if (upper === "TYPES" || upper === "TYPE") return "TYPES";
			if (upper === "CONSTANTS" || upper === "CONST") return "CONSTANTS";
			if (upper === "SERVICE") return "SERVICE";
			if (upper === "HELPERS" || upper === "HELPER FUNCTIONS" || upper === "HELPER METHODS" || upper === "HELPER UTILITIES")
				return "HELPERS";
			if (upper === "MAIN" || upper === "MAIN CARD FUNCTION" || upper === "MAIN CREATE METHOD")
				return "MAIN";
			// Sub-sections like "STRIPE SERVICE", "UI", "SECTIONS" are ignored
			return upper;
		},
		commentStyle: "double-slash",
	},

	swift: {
		name: "Swift",
		extensions: [".swift"],
		sectionOrder: [
			"PROPERTIES",
			"INITIALIZATION",
			"PUBLIC",
			"PRIVATE",
			"ACTIONS",
		],
		sectionPattern: /\/\/\s*MARK:\s*-?\s*(.+)/,
		extractContent: (content: string) => content,
		normalizeSection: (section: string) => {
			const lower = section.toLowerCase();
			if (lower.includes("propert")) return "PROPERTIES";
			if (lower.includes("init") || lower.includes("setup"))
				return "INITIALIZATION";
			if (lower.includes("public")) return "PUBLIC";
			if (lower.includes("private") || lower.includes("helper"))
				return "PRIVATE";
			if (lower.includes("action")) return "ACTIONS";
			if (lower.includes("protocol")) return "PUBLIC";
			return section.toUpperCase();
		},
		commentStyle: "mark",
	},
};

// ─────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────

interface SectionMatch {
	name: string;
	line: number;
	normalizedName: string;
	hasProperFormat: boolean; // Has === separators above and below
}

interface ValidationResult {
	file: string;
	framework: string;
	valid: boolean;
	sections: SectionMatch[];
	errors: string[];
}

interface CLIOptions {
	framework?: string;
	fix?: boolean;
	path?: string;
}

// ─────────────────────────────────────────────────
// DETECTION & VALIDATION
// ─────────────────────────────────────────────────

function detectFramework(filePath: string): FrameworkConfig | null {
	const ext = extname(filePath);

	// Check for explicit framework by extension
	for (const config of Object.values(FRAMEWORKS)) {
		if (config.extensions.includes(ext)) {
			// Special case: .ts could be GAS or regular TypeScript
			if (ext === ".ts") {
				// Check if it's in a GAS project (has appsscript.json or specific patterns)
				const content = readFileSync(filePath, "utf-8");
				if (
					content.includes("CardService") ||
					content.includes("SpreadsheetApp") ||
					content.includes("UrlFetchApp") ||
					content.includes("PropertiesService")
				) {
					return FRAMEWORKS.gas;
				}
				// Skip regular .ts files (not GAS)
				return null;
			}
			return config;
		}
	}
	return null;
}

const SEPARATOR_PATTERN = /^\/\/\s*=+\s*$/;

function findSections(
	content: string,
	config: FrameworkConfig,
): SectionMatch[] {
	const lines = content.split("\n");
	const sections: SectionMatch[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		// Skip separator lines
		if (SEPARATOR_PATTERN.test(line) || line.match(/^\/\/\s*-+\s*$/)) continue;

		const match = line.match(config.sectionPattern);
		if (match) {
			const sectionName = match[1].trim();
			const normalized = config.normalizeSection(sectionName);

			// Only track sections that are in the expected order
			if (config.sectionOrder.includes(normalized)) {
				// Check for proper format: separator above and below
				const prevLine = i > 0 ? lines[i - 1].trim() : "";
				const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : "";
				const hasProperFormat =
					SEPARATOR_PATTERN.test(prevLine) && SEPARATOR_PATTERN.test(nextLine);

				sections.push({
					name: sectionName,
					line: i + 1,
					normalizedName: normalized,
					hasProperFormat,
				});
			}
		}
	}

	return sections;
}

function validateOrder(
	sections: SectionMatch[],
	config: FrameworkConfig,
): string[] {
	const errors: string[] = [];

	if (sections.length < 2) {
		return errors; // Skip files with too few sections
	}

	// Check for duplicates
	const seen = new Set<string>();
	for (const section of sections) {
		if (seen.has(section.normalizedName)) {
			errors.push(
				`Duplicate section "${section.name}" at line ${section.line}`,
			);
		}
		seen.add(section.normalizedName);
	}

	// Check ordering
	let lastIndex = -1;
	for (const section of sections) {
		const expectedIndex = config.sectionOrder.indexOf(section.normalizedName);
		if (expectedIndex === -1) continue;

		if (expectedIndex < lastIndex) {
			const shouldComeBefore = config.sectionOrder.filter(
				(s, idx) =>
					idx > expectedIndex &&
					idx <= lastIndex &&
					sections.some((sec) => sec.normalizedName === s),
			);
			if (shouldComeBefore.length > 0) {
				errors.push(
					`Section "${section.name}" at line ${section.line} should come before: ${shouldComeBefore.join(", ")}`,
				);
			}
		}
		lastIndex = Math.max(lastIndex, expectedIndex);
	}

	// Check format (skip for Swift which uses MARK:)
	if (config.commentStyle !== "mark") {
		for (const section of sections) {
			if (!section.hasProperFormat) {
				errors.push(
					`Section "${section.name}" at line ${section.line} missing === separators`,
				);
			}
		}
	}

	return errors;
}

function validateFile(
	filePath: string,
	config: FrameworkConfig,
): ValidationResult {
	const content = readFileSync(filePath, "utf-8");
	const scriptContent = config.extractContent(content);

	if (!scriptContent) {
		return {
			file: filePath,
			framework: config.name,
			valid: true,
			sections: [],
			errors: [],
		};
	}

	const sections = findSections(scriptContent, config);
	const errors = validateOrder(sections, config);

	return {
		file: filePath,
		framework: config.name,
		valid: errors.length === 0,
		sections,
		errors,
	};
}

// ─────────────────────────────────────────────────
// FILE DISCOVERY
// ─────────────────────────────────────────────────

function getAllFiles(dir: string, extensions: string[]): string[] {
	const files: string[] = [];

	function walk(currentDir: string) {
		try {
			const entries = readdirSync(currentDir);
			for (const entry of entries) {
				const fullPath = join(currentDir, entry);
				const stat = statSync(fullPath);

				if (stat.isDirectory()) {
					// Skip common non-source directories
					if (
						!entry.startsWith(".") &&
						entry !== "node_modules" &&
						entry !== "build" &&
						entry !== "dist" &&
						entry !== ".output"
					) {
						walk(fullPath);
					}
				} else if (extensions.some((ext) => entry.endsWith(ext))) {
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
// CLI
// ─────────────────────────────────────────────────

function parseArgs(): CLIOptions {
	const args = process.argv.slice(2);
	const options: CLIOptions = {};

	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--framework" && args[i + 1]) {
			options.framework = args[i + 1];
			i++;
		} else if (args[i] === "--fix") {
			options.fix = true;
		} else if (!args[i].startsWith("-")) {
			options.path = args[i];
		}
	}

	return options;
}

function main() {
	const options = parseArgs();
	const srcDir = options.path || join(process.cwd(), "src");

	// Determine which frameworks to check
	let frameworkConfigs: FrameworkConfig[];
	if (options.framework) {
		const config = FRAMEWORKS[options.framework];
		if (!config) {
			console.error(
				`Unknown framework: ${options.framework}. Available: ${Object.keys(FRAMEWORKS).join(", ")}`,
			);
			process.exit(1);
		}
		frameworkConfigs = [config];
	} else {
		frameworkConfigs = Object.values(FRAMEWORKS);
	}

	// Collect all extensions
	const allExtensions = frameworkConfigs.flatMap((c) => c.extensions);
	const files = getAllFiles(srcDir, allExtensions);

	console.log(`\n🔍 Validating section order in ${files.length} files...\n`);

	const results: ValidationResult[] = [];
	const stats = {
		valid: 0,
		skipped: 0,
		invalid: 0,
		byFramework: {} as Record<string, { valid: number; invalid: number }>,
	};

	for (const file of files) {
		const config = detectFramework(file);
		if (!config) continue;

		const result = validateFile(file, config);
		results.push(result);

		// Update stats
		if (!stats.byFramework[config.name]) {
			stats.byFramework[config.name] = { valid: 0, invalid: 0 };
		}

		if (result.sections.length < 2) {
			stats.skipped++;
		} else if (result.valid) {
			stats.valid++;
			stats.byFramework[config.name].valid++;
		} else {
			stats.invalid++;
			stats.byFramework[config.name].invalid++;
		}
	}

	// Print invalid results
	const invalidResults = results.filter(
		(r) => !r.valid && r.sections.length >= 2,
	);

	if (invalidResults.length > 0) {
		console.log("❌ Files with section ordering issues:\n");

		for (const result of invalidResults) {
			const relativePath = relative(process.cwd(), result.file);
			console.log(`  ${relativePath} (${result.framework})`);
			console.log(
				`    Sections: ${result.sections.map((s) => s.name).join(" → ")}`,
			);
			for (const error of result.errors) {
				console.log(`    ⚠️  ${error}`);
			}
			console.log();
		}
	}

	// Summary
	console.log("─".repeat(50));
	console.log(`✅ Valid: ${stats.valid}`);
	console.log(`⏭️  Skipped (< 2 sections): ${stats.skipped}`);
	console.log(`❌ Invalid: ${stats.invalid}`);
	console.log();

	// Per-framework summary
	if (Object.keys(stats.byFramework).length > 1) {
		console.log("By framework:");
		for (const [name, frameworkStats] of Object.entries(stats.byFramework)) {
			console.log(
				`  ${name}: ${frameworkStats.valid} valid, ${frameworkStats.invalid} invalid`,
			);
		}
		console.log();
	}

	// Print expected orders
	if (stats.invalid > 0) {
		console.log("Expected section orders:");
		for (const config of frameworkConfigs) {
			if (stats.byFramework[config.name]?.invalid > 0) {
				console.log(`  ${config.name}: ${config.sectionOrder.join(" → ")}`);
			}
		}
		console.log();
		process.exit(1);
	}

	console.log("All files follow section ordering guidelines! 🎉\n");
}

main();
