#!/bin/bash
# Cloudflare Pages Project Manager
# Full programmatic control over your Cloudflare deployments
#
# Usage:
#   ./scripts/cf-manage.sh list                    # List all Pages projects
#   ./scripts/cf-manage.sh create <name>           # Create a new project
#   ./scripts/cf-manage.sh delete <name>           # Delete a project
#   ./scripts/cf-manage.sh deployments <name>      # List deployments for a project
#   ./scripts/cf-manage.sh deploy <dir> [name]     # Build and deploy

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

log() { echo -e "${BLUE}→${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1" >&2; exit 1; }

ensure_wrangler() {
  command -v wrangler >/dev/null 2>&1 || error "wrangler required: pnpm add -g wrangler"
  if ! wrangler whoami >/dev/null 2>&1; then
    log "Authenticating with Cloudflare..."
    wrangler login
  fi
}

cmd_list() {
  ensure_wrangler
  log "Listing all Cloudflare Pages projects..."
  wrangler pages project list
}

cmd_create() {
  local name="${1:?Usage: $0 create <project-name>}"
  ensure_wrangler
  log "Creating project '$name'..."
  wrangler pages project create "$name" --production-branch=main
  success "Project created: https://$name.pages.dev"
}

cmd_delete() {
  local name="${1:?Usage: $0 delete <project-name>}"
  ensure_wrangler
  warn "This will permanently delete '$name' and all its deployments!"
  read -p "Type the project name to confirm: " confirm
  [[ "$confirm" == "$name" ]] || error "Aborted"
  wrangler pages project delete "$name" --yes
  success "Project '$name' deleted"
}

cmd_deployments() {
  local name="${1:?Usage: $0 deployments <project-name>}"
  ensure_wrangler
  log "Listing deployments for '$name'..."
  wrangler pages deployment list --project-name="$name"
}

cmd_deploy() {
  local dir="${1:?Usage: $0 deploy <project-dir> [project-name]}"
  local name="${2:-$(basename $(pwd))-$dir}"

  ensure_wrangler
  cd "$dir" || error "Directory '$dir' not found"

  log "Installing dependencies..."
  pnpm install --frozen-lockfile

  case "$dir" in
    nextjs)
      log "Building Next.js with OpenNext..."
      pnpm exec opennextjs-cloudflare
      log "Deploying '$name'..."
      wrangler deploy
      ;;
    sveltekit)
      log "Building SvelteKit..."
      pnpm build
      log "Deploying '$name' to Cloudflare Pages..."
      wrangler pages deploy .svelte-kit/cloudflare --project-name="$name"
      ;;
    *)
      error "Unknown project: $dir"
      ;;
  esac

  success "Live at: https://$name.pages.dev"
}

cmd_help() {
  cat << 'EOF'
Cloudflare Pages Project Manager

Commands:
  list                    List all your Cloudflare Pages projects
  create <name>           Create a new empty Pages project
  delete <name>           Delete a project (requires confirmation)
  deployments <name>      List all deployments for a project
  deploy <dir> [name]     Build and deploy (nextjs or sveltekit)

Examples:
  ./scripts/cf-manage.sh list
  ./scripts/cf-manage.sh create my-new-app
  ./scripts/cf-manage.sh deploy nextjs client-portal
  ./scripts/cf-manage.sh deploy sveltekit dashboard-v2
  ./scripts/cf-manage.sh deployments client-portal
  ./scripts/cf-manage.sh delete old-project

Environment Variables:
  CLOUDFLARE_API_TOKEN    Skip interactive login
  CLOUDFLARE_ACCOUNT_ID   Required for API token auth
EOF
}

# Main
case "${1:-help}" in
  list)        cmd_list ;;
  create)      cmd_create "$2" ;;
  delete)      cmd_delete "$2" ;;
  deployments) cmd_deployments "$2" ;;
  deploy)      cmd_deploy "$2" "$3" ;;
  help|--help|-h) cmd_help ;;
  *) error "Unknown command: $1. Run '$0 help' for usage." ;;
esac
