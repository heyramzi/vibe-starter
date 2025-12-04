#!/bin/bash
# Programmatic Cloudflare Pages deployment script
# Usage: ./scripts/cf-deploy.sh <project-dir> [project-name]
#
# Examples:
#   ./scripts/cf-deploy.sh nextjs
#   ./scripts/cf-deploy.sh sveltekit my-custom-name
#   ./scripts/cf-deploy.sh nextjs client-glance-nextjs

set -e

PROJECT_DIR="${1:?Usage: $0 <project-dir> [project-name]}"
PROJECT_NAME="${2:-$(basename $(pwd))-$PROJECT_DIR}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}→${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1" >&2; exit 1; }

# Verify prerequisites
command -v pnpm >/dev/null 2>&1 || error "pnpm is required"
command -v wrangler >/dev/null 2>&1 || error "wrangler is required (pnpm add -g wrangler)"

# Check if logged in to Cloudflare
if ! wrangler whoami >/dev/null 2>&1; then
  log "Not logged in to Cloudflare. Running wrangler login..."
  wrangler login
fi

cd "$PROJECT_DIR" || error "Directory '$PROJECT_DIR' not found"

log "Building $PROJECT_DIR..."

case "$PROJECT_DIR" in
  nextjs)
    pnpm install --frozen-lockfile
    pnpm exec opennextjs-cloudflare
    log "Deploying to Cloudflare as '$PROJECT_NAME'..."
    wrangler deploy
    ;;
  sveltekit)
    pnpm install --frozen-lockfile
    pnpm build
    log "Deploying to Cloudflare Pages as '$PROJECT_NAME'..."
    wrangler pages deploy .svelte-kit/cloudflare --project-name="$PROJECT_NAME"
    ;;
  *)
    error "Unknown project type: $PROJECT_DIR (expected 'nextjs' or 'sveltekit')"
    ;;
esac

success "Deployed! Your app is live at: https://$PROJECT_NAME.pages.dev"
