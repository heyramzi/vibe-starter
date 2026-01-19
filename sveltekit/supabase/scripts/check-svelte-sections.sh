#!/bin/bash
# check-svelte-sections.sh
# Validates Svelte files follow the required section structure
#
# Section order (only include sections with content):
# 1. IMPORTS
# 2. TYPES
# 3. PROPS
# 4. STATE
# 5. DERIVED
# 6. EFFECTS
# 7. FUNCTIONS
# 8. MARKUP (HTML)
# 9. STYLES

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Section order for validation
SECTIONS=("IMPORTS" "TYPES" "PROPS" "STATE" "DERIVED" "EFFECTS" "FUNCTIONS")

check_file() {
	local file="$1"
	local errors=()
	local found_sections=()
	local line_numbers=()

	# Skip files in node_modules, .svelte-kit, build, dist
	if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".svelte-kit"* ]] || [[ "$file" == *"build"* ]] || [[ "$file" == *"dist"* ]]; then
		return 0
	fi

	# Skip UI component library files (shadcn-svelte)
	if [[ "$file" == *"/components/ui/"* ]]; then
		return 0
	fi

	# Read file and find sections
	local line_num=0
	while IFS= read -r line || [[ -n "$line" ]]; do
		((line_num++))
		# Check for section comments like "// ===... SECTION ===..." or "// SECTION"
		for section in "${SECTIONS[@]}"; do
			if [[ "$line" =~ ^[[:space:]]*//[[:space:]]*=*[[:space:]]*${section}[[:space:]]*=*[[:space:]]*$ ]] || \
			   [[ "$line" =~ ^[[:space:]]*//[[:space:]]*${section}[[:space:]]*$ ]]; then
				found_sections+=("$section")
				line_numbers+=("$line_num")
			fi
		done
	done < "$file"

	# Check section order
	local prev_index=-1
	for i in "${!found_sections[@]}"; do
		local section="${found_sections[$i]}"
		local line="${line_numbers[$i]}"

		# Find index in SECTIONS array
		local current_index=-1
		for j in "${!SECTIONS[@]}"; do
			if [[ "${SECTIONS[$j]}" == "$section" ]]; then
				current_index=$j
				break
			fi
		done

		if [[ $current_index -lt $prev_index ]]; then
			errors+=("Line $line: '$section' is out of order (should come before previous section)")
		fi
		prev_index=$current_index
	done

	# Report errors
	if [[ ${#errors[@]} -gt 0 ]]; then
		echo -e "${RED}ERROR${NC}: $file"
		for error in "${errors[@]}"; do
			echo -e "  ${YELLOW}→${NC} $error"
		done
		return 1
	fi

	return 0
}

main() {
	local files=()
	local has_errors=0

	# If arguments provided, check those files
	if [[ $# -gt 0 ]]; then
		files=("$@")
	else
		# Find all .svelte files
		while IFS= read -r -d '' file; do
			files+=("$file")
		done < <(find . -name "*.svelte" -type f -print0 2>/dev/null)
	fi

	if [[ ${#files[@]} -eq 0 ]]; then
		echo -e "${GREEN}No Svelte files to check${NC}"
		exit 0
	fi

	echo "Checking ${#files[@]} Svelte file(s)..."
	echo ""

	for file in "${files[@]}"; do
		if ! check_file "$file"; then
			has_errors=1
		fi
	done

	echo ""
	if [[ $has_errors -eq 1 ]]; then
		echo -e "${RED}Section order validation failed${NC}"
		echo ""
		echo "Expected order: IMPORTS → TYPES → PROPS → STATE → DERIVED → EFFECTS → FUNCTIONS"
		exit 1
	else
		echo -e "${GREEN}All files pass section order validation${NC}"
	fi
}

main "$@"
