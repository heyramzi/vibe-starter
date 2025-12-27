#!/bin/bash

# Vibe Starter Setup Script
# Usage: ./setup.sh <variant>

set -e

usage() {
  echo "Usage: ./setup.sh <variant>"
  echo ""
  echo "Variants:"
  echo "  nextjs-supabase     Next.js 16 + Supabase"
  echo "  nextjs-convex       Next.js 16 + Convex"
  echo "  sveltekit-supabase  SvelteKit 2 + Supabase"
  echo "  sveltekit-convex    SvelteKit 2 + Convex"
  echo ""
  echo "Example:"
  echo "  ./setup.sh nextjs-convex"
  exit 1
}

case "$1" in
  nextjs-supabase)
    FRAMEWORK="nextjs"
    BACKEND="supabase"
    ENV_FILE=".env.local"
    ;;
  nextjs-convex)
    FRAMEWORK="nextjs"
    BACKEND="convex"
    ENV_FILE=".env.local"
    ;;
  sveltekit-supabase)
    FRAMEWORK="sveltekit"
    BACKEND="supabase"
    ENV_FILE=".env"
    ;;
  sveltekit-convex)
    FRAMEWORK="sveltekit"
    BACKEND="convex"
    ENV_FILE=".env"
    ;;
  *)
    usage
    ;;
esac

OTHER_FRAMEWORK=$([[ "$FRAMEWORK" == "nextjs" ]] && echo "sveltekit" || echo "nextjs")

echo "Setting up $FRAMEWORK with $BACKEND..."

# Remove other framework entirely
rm -rf "$OTHER_FRAMEWORK"
echo "Removed $OTHER_FRAMEWORK/"

# Move selected variant to framework root, then to project root
mv "$FRAMEWORK/$BACKEND"/* "$FRAMEWORK/$BACKEND"/.[!.]* . 2>/dev/null || mv "$FRAMEWORK/$BACKEND"/* .
rm -rf "$FRAMEWORK"
echo "Moved $FRAMEWORK/$BACKEND/ contents to root"

# Set up environment file from backend-specific template
if [[ -f ".env.example.$BACKEND" ]]; then
  cp ".env.example.$BACKEND" "$ENV_FILE"
  echo "Created $ENV_FILE from .env.example.$BACKEND"
elif [[ -f ".env.example" ]]; then
  cp ".env.example" "$ENV_FILE"
  echo "Created $ENV_FILE from .env.example"
fi

# Clean up env templates
rm -f .env.example.supabase .env.example.convex 2>/dev/null

echo ""
echo "Done! Next steps:"
echo "  1. Edit $ENV_FILE with your credentials"
echo "  2. Run: pnpm install"
echo "  3. Run: pnpm dev"
