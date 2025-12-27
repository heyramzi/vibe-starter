#!/usr/bin/env bash
# Reinstall all shadcn/shadcn-svelte components
# Safe to run since components are primitives we don't modify
#
# Usage: Run from any project variant directory (nextjs/*, sveltekit/*)
#   ../../scripts/reinstall-shadcn.sh
# Or from project root:
#   ./scripts/reinstall-shadcn.sh nextjs/convex
#   ./scripts/reinstall-shadcn.sh sveltekit/supabase

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Determine project directory
if [ -n "$1" ]; then
  cd "$1" || { echo -e "${RED}Directory $1 not found${NC}"; exit 1; }
fi

# Check for components.json
if [ ! -f "components.json" ]; then
  echo -e "${RED}Error: components.json not found${NC}"
  echo "Run from a project variant directory (e.g., nextjs/convex)"
  exit 1
fi

# Detect project type
SCHEMA=$(grep -o '"$schema"[^,]*' components.json | head -1)

if echo "$SCHEMA" | grep -q "shadcn-svelte"; then
  echo -e "${GREEN}Detected: shadcn-svelte${NC}"
  pnpm dlx shadcn-svelte@latest add --all --overwrite --yes
elif echo "$SCHEMA" | grep -q "ui.shadcn.com"; then
  echo -e "${GREEN}Detected: shadcn/ui${NC}"
  pnpm dlx shadcn@latest add --all --overwrite --yes
else
  echo -e "${RED}Error: Unknown components.json schema${NC}"
  exit 1
fi

echo -e "${GREEN}Done!${NC}"
