#!/bin/bash

# Vibe Starter Setup Script
# Usage: ./setup.sh nextjs   or   ./setup.sh sveltekit

set -e

FRAMEWORK="$1"

if [[ "$FRAMEWORK" != "nextjs" && "$FRAMEWORK" != "sveltekit" ]]; then
  echo "Usage: ./setup.sh <framework>"
  echo ""
  echo "Frameworks:"
  echo "  nextjs     - Next.js 16 + React 19 + shadcn/ui"
  echo "  sveltekit  - SvelteKit 2 + Svelte 5 + bits-ui"
  echo ""
  echo "Example:"
  echo "  ./setup.sh nextjs"
  exit 1
fi

if [[ "$FRAMEWORK" == "nextjs" ]]; then
  OTHER="sveltekit"
  ENV_FILE=".env.local"
else
  OTHER="nextjs"
  ENV_FILE=".env"
fi

echo "Setting up $FRAMEWORK..."

# Remove the other framework
rm -rf "$OTHER"
echo "Removed $OTHER/"

# Move framework files to root
mv "$FRAMEWORK"/* .
mv "$FRAMEWORK"/.[!.]* . 2>/dev/null || true
rm -rf "$FRAMEWORK"
echo "Moved $FRAMEWORK/ contents to root"

# Set up environment file
if [[ -f ".env.example" ]]; then
  cp .env.example "$ENV_FILE"
  echo "Created $ENV_FILE from .env.example"
fi

echo ""
echo "Done! Next steps:"
echo "  1. Edit $ENV_FILE with your Supabase credentials"
echo "  2. Run: pnpm install"
echo "  3. Run: pnpm dev"
