#!/usr/bin/env tsx
/**
 * Project Structure Validator
 *
 * Validates folder structure against conventions:
 * - Component organization (ui/, features/, layouts/)
 * - Framework-specific patterns (SvelteKit routes, Next.js app router)
 * - No orphan folders or misplaced files
 *
 * Usage: pnpm lint:structure [--framework svelte|nextjs]
 */

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, basename, dirname } from "node:path";

// ─────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────

interface FrameworkRules {
	name: string;
	componentExtensions: string[];
	allowedComponentFolders: string[];
	requiredFolders: string[];
	forbiddenFolders: string[];
	routeFolder: string;
	routeFilePattern: RegExp;
	layoutFilePattern: RegExp;
}

const FRAMEWORKS: Record<string, FrameworkRules> = {
	svelte: {
		name: "SvelteKit",
		componentExtensions: [".svelte"],
		allowedComponentFolders: [
			"src/components/ui", // Primitives: Button, Input, Card, etc.
			"src/components/layouts", // Layout components
			"src/components", // Feature folders under components/
			"src/lib/components", // shadcn-svelte default location
		],
		requiredFolders: ["src/lib"],
		forbiddenFolders: [
			"src/utils",
			"src/services",
			"src/helpers",
			"src/config",
			"src/shared", // Use components/ or lib/
			"src/common", // Use components/ or lib/
		],
		routeFolder: "src/routes",
		routeFilePattern: /^\+page\.svelte$|^\+page\.ts$|^\+page\.server\.ts$/,
		layoutFilePattern: /^\+layout\.svelte$|^\+layout\.ts$|^\+layout\.server\.ts$/,
	},

	nextjs: {
		name: "Next.js",
		componentExtensions: [".tsx", ".jsx"],
		allowedComponentFolders: [
			"src/components/ui", // Primitives
			"src/components/layouts", // Layout components
			"src/components", // Feature folders
			"src/lib/components", // shadcn-ui default location
			"src/contexts", // Context providers
			"src/app", // Co-located route components (valid Next.js pattern)
		],
		requiredFolders: ["src/lib", "src/app"],
		forbiddenFolders: [
			"src/utils",
			"src/services",
			"src/helpers",
			"src/config",
			"src/shared",
			"src/common",
			"pages", // Use app router, not pages router
		],
		routeFolder: "src/app",
		routeFilePattern: /^page\.tsx$|^page\.ts$/,
		layoutFilePattern: /^layout\.tsx$|^layout\.ts$/,
	},
};

// ─────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────

interface Violation {
	path: string;
	rule: string;
	message: string;
	suggestion?: string;
}

interface ValidationResult {
	violations: Violation[];
	stats: {
		foldersChecked: number;
		componentsFound: number;
	};
}

// ─────────────────────────────────────────────────
// VALIDATORS
// ─────────────────────────────────────────────────

function checkForbiddenFolders(
	srcDir: string,
	rules: FrameworkRules,
): Violation[] {
	const violations: Violation[] = [];

	for (const folder of rules.forbiddenFolders) {
		const fullPath = join(dirname(srcDir), folder);
		if (existsSync(fullPath)) {
			const suggestion =
				folder.includes("utils") ||
				folder.includes("helpers") ||
				folder.includes("services")
					? "Move contents to src/lib/"
					: folder === "pages"
						? "Use App Router (src/app/) instead of Pages Router"
						: "Move contents to src/components/ or src/lib/";

			violations.push({
				path: folder,
				rule: "no-forbidden-folders",
				message: `Forbidden folder "${folder}" exists`,
				suggestion,
			});
		}
	}

	return violations;
}

function checkRequiredFolders(
	srcDir: string,
	rules: FrameworkRules,
): Violation[] {
	const violations: Violation[] = [];

	for (const folder of rules.requiredFolders) {
		const fullPath = join(dirname(srcDir), folder);
		if (!existsSync(fullPath)) {
			violations.push({
				path: folder,
				rule: "missing-required-folder",
				message: `Required folder "${folder}" is missing`,
				suggestion: `Create ${folder}/`,
			});
		}
	}

	return violations;
}

function checkComponentLocation(
	srcDir: string,
	rules: FrameworkRules,
): Violation[] {
	const violations: Violation[] = [];
	const baseDir = dirname(srcDir);

	// Next.js App Router special files that should stay in app/
	const NEXTJS_ROUTE_FILES = [
		"page.tsx",
		"page.ts",
		"layout.tsx",
		"layout.ts",
		"loading.tsx",
		"error.tsx",
		"not-found.tsx",
		"template.tsx",
		"default.tsx",
	];

	// SvelteKit special files that should stay in routes/
	const SVELTEKIT_ROUTE_FILES = [
		"+page.svelte",
		"+page.ts",
		"+page.server.ts",
		"+layout.svelte",
		"+layout.ts",
		"+layout.server.ts",
		"+error.svelte",
		"+server.ts",
	];

	function walk(dir: string) {
		try {
			const entries = readdirSync(dir);

			for (const entry of entries) {
				const fullPath = join(dir, entry);
				const relativePath = relative(baseDir, fullPath);
				const stat = statSync(fullPath);

				if (stat.isDirectory()) {
					// Skip node_modules, build folders, etc.
					if (
						entry.startsWith(".") ||
						entry === "node_modules" ||
						entry === "build" ||
						entry === "dist" ||
						entry === ".svelte-kit" ||
						entry === ".next"
					) {
						continue;
					}
					walk(fullPath);
				} else {
					// Check if it's a component file
					const isComponent = rules.componentExtensions.some((ext) =>
						entry.endsWith(ext),
					);
					if (!isComponent) continue;

					// Skip route files in route folders
					const isInRouteFolder =
						relativePath.startsWith("src/routes") ||
						relativePath.startsWith("src/app");

					if (isInRouteFolder) {
						// Skip Next.js and SvelteKit special route files
						if (
							NEXTJS_ROUTE_FILES.includes(entry) ||
							SVELTEKIT_ROUTE_FILES.includes(entry)
						) {
							continue;
						}
						// Other components in route folders are still flagged
					}

					// Check if component is in allowed location
					const inAllowedFolder = rules.allowedComponentFolders.some(
						(allowed) =>
							relativePath.startsWith(allowed) ||
							relativePath.startsWith(allowed.replace("src/", "")),
					);

					if (!inAllowedFolder) {
						// Determine better location
						let suggestion = "Move to src/components/";

						if (entry.match(/^(Button|Input|Card|Badge|Modal|Dialog)/i)) {
							suggestion = "Move to src/components/ui/";
						} else if (entry.match(/Layout/i)) {
							suggestion = "Move to src/components/layouts/";
						}

						violations.push({
							path: relativePath,
							rule: "component-location",
							message: `Component "${entry}" is outside allowed component folders`,
							suggestion,
						});
					}
				}
			}
		} catch {
			// Skip directories we can't read
		}
	}

	walk(srcDir);
	return violations;
}

function checkComponentNaming(
	srcDir: string,
	rules: FrameworkRules,
): Violation[] {
	const violations: Violation[] = [];
	const baseDir = dirname(srcDir);
	const componentsDir = join(baseDir, "src/components");

	if (!existsSync(componentsDir)) return violations;

	function walk(dir: string) {
		try {
			const entries = readdirSync(dir);

			for (const entry of entries) {
				const fullPath = join(dir, entry);
				const relativePath = relative(baseDir, fullPath);
				const stat = statSync(fullPath);

				if (stat.isDirectory()) {
					// Folder names should be lowercase-kebab or lowercase
					if (entry !== entry.toLowerCase() && !entry.startsWith(".")) {
						violations.push({
							path: relativePath,
							rule: "folder-naming",
							message: `Folder "${entry}" should be lowercase`,
							suggestion: `Rename to "${entry.toLowerCase()}"`,
						});
					}
					walk(fullPath);
				} else {
					// Component files should be PascalCase
					const isComponent = rules.componentExtensions.some((ext) =>
						entry.endsWith(ext),
					);
					if (!isComponent) continue;

					const nameWithoutExt = entry.replace(/\.[^.]+$/, "");

					// Skip index files and test files
					if (nameWithoutExt === "index") continue;
					if (nameWithoutExt.endsWith(".test") || nameWithoutExt.endsWith(".spec"))
						continue;

					// Allow numbered prefixes for screen ordering (e.g., 2-WorkspacesScreen)
					const nameForCheck = nameWithoutExt.replace(/^\d+-/, "");

					// Check PascalCase (starts with uppercase, no remaining hyphens/underscores)
					// Also allow kebab-case for shadcn-style components (button.svelte, alert-title.svelte)
					const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(nameForCheck);
					const isKebabCase = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(nameForCheck);

					if (!isPascalCase && !isKebabCase) {
						const pascalCase = nameForCheck
							.split(/[-_]/)
							.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
							.join("");

						violations.push({
							path: relativePath,
							rule: "component-naming",
							message: `Component "${entry}" should be PascalCase or kebab-case`,
							suggestion: `Rename to "${pascalCase}${entry.slice(entry.lastIndexOf("."))}"`,
						});
					}
				}
			}
		} catch {
			// Skip directories we can't read
		}
	}

	walk(componentsDir);
	return violations;
}

function checkUIFolderStructure(
	srcDir: string,
	rules: FrameworkRules,
): Violation[] {
	const violations: Violation[] = [];
	const baseDir = dirname(srcDir);
	const uiDir = join(baseDir, "src/components/ui");

	if (!existsSync(uiDir)) return violations;

	const entries = readdirSync(uiDir);

	for (const entry of entries) {
		const fullPath = join(uiDir, entry);
		const stat = statSync(fullPath);

		// UI folder should contain individual components or folders per component
		if (stat.isDirectory()) {
			// Check that each UI component folder has an index or main component file
			const folderContents = readdirSync(fullPath);
			const hasMainFile = folderContents.some(
				(f) =>
					f === "index.ts" ||
					f === "index.tsx" ||
					f === "index.svelte" ||
					rules.componentExtensions.some(
						(ext) => f.toLowerCase() === entry.toLowerCase() + ext,
					),
			);

			if (!hasMainFile) {
				violations.push({
					path: `src/components/ui/${entry}`,
					rule: "ui-component-structure",
					message: `UI component folder "${entry}" should have an index file or matching component file`,
					suggestion: `Add index.ts that exports the component, or rename main component to ${entry}${rules.componentExtensions[0]}`,
				});
			}
		}
	}

	return violations;
}

// ─────────────────────────────────────────────────
// DETECTION
// ─────────────────────────────────────────────────

function detectFramework(dir: string): FrameworkRules | null {
	// Check for SvelteKit
	if (existsSync(join(dir, "svelte.config.js"))) {
		return FRAMEWORKS.svelte;
	}
	if (existsSync(join(dir, "svelte.config.ts"))) {
		return FRAMEWORKS.svelte;
	}

	// Check for WXT (Svelte-based browser extension)
	if (existsSync(join(dir, "wxt.config.ts"))) {
		return FRAMEWORKS.svelte;
	}

	// Check for Next.js
	if (existsSync(join(dir, "next.config.js"))) {
		return FRAMEWORKS.nextjs;
	}
	if (existsSync(join(dir, "next.config.ts"))) {
		return FRAMEWORKS.nextjs;
	}
	if (existsSync(join(dir, "next.config.mjs"))) {
		return FRAMEWORKS.nextjs;
	}

	return null;
}

// ─────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────

function parseArgs(): { framework?: string; path?: string } {
	const args = process.argv.slice(2);
	const options: { framework?: string; path?: string } = {};

	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--framework" && args[i + 1]) {
			options.framework = args[i + 1];
			i++;
		} else if (!args[i].startsWith("-")) {
			options.path = args[i];
		}
	}

	return options;
}

function main() {
	const options = parseArgs();
	const projectDir = options.path || process.cwd();
	const srcDir = join(projectDir, "src");

	// Determine framework
	let rules: FrameworkRules;
	if (options.framework) {
		const config = FRAMEWORKS[options.framework];
		if (!config) {
			console.error(
				`Unknown framework: ${options.framework}. Available: ${Object.keys(FRAMEWORKS).join(", ")}`,
			);
			process.exit(1);
		}
		rules = config;
	} else {
		const detected = detectFramework(projectDir);
		if (!detected) {
			console.error(
				"Could not detect framework. Use --framework svelte|nextjs",
			);
			process.exit(1);
		}
		rules = detected;
	}

	console.log(`\n🔍 Validating ${rules.name} project structure...\n`);

	const violations: Violation[] = [];

	// Run all checks
	violations.push(...checkForbiddenFolders(srcDir, rules));
	violations.push(...checkRequiredFolders(srcDir, rules));
	violations.push(...checkComponentLocation(srcDir, rules));
	violations.push(...checkComponentNaming(srcDir, rules));
	violations.push(...checkUIFolderStructure(srcDir, rules));

	// Group by rule
	const byRule = new Map<string, Violation[]>();
	for (const v of violations) {
		if (!byRule.has(v.rule)) {
			byRule.set(v.rule, []);
		}
		byRule.get(v.rule)!.push(v);
	}

	// Print violations
	if (violations.length > 0) {
		console.log("❌ Structure issues found:\n");

		for (const [rule, ruleViolations] of byRule) {
			console.log(`  [${rule}]`);
			for (const v of ruleViolations) {
				console.log(`    ⚠️  ${v.path}`);
				console.log(`       ${v.message}`);
				if (v.suggestion) {
					console.log(`       💡 ${v.suggestion}`);
				}
			}
			console.log();
		}
	}

	// Summary
	console.log("─".repeat(50));
	console.log(`Framework: ${rules.name}`);
	console.log(`Violations: ${violations.length}`);

	if (violations.length > 0) {
		console.log(`\n📋 Expected structure:`);
		console.log(`   src/`);
		console.log(`   ├── components/`);
		console.log(`   │   ├── ui/           # Primitives (Button, Input, Card)`);
		console.log(`   │   ├── layouts/      # Layout components`);
		console.log(`   │   └── [feature]/    # Feature-specific components`);
		console.log(`   ├── lib/              # All utilities, services, helpers`);
		console.log(
			`   └── ${rules.routeFolder.replace("src/", "")}/             # Routes`,
		);
		console.log();
		process.exit(1);
	}

	console.log("\n✅ Project structure is valid! 🎉\n");
}

main();
