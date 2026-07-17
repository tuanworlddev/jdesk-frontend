#!/usr/bin/env bash
# Idempotent deploy for the VPS. Pulls latest, builds both apps, applies DB
# migrations (never re-seeds — that would overwrite admin edits), and reloads
# PM2. Run manually or via the GitHub Actions deploy job.
set -euo pipefail

ROOT="${JDESK_ROOT:-/var/www/jdesk}"

update_repo() {
  local name="$1"
  local directory="$2"

  echo "==> Update $name"
  cd "$directory"
  if [[ "$(git branch --show-current)" != "main" ]]; then
    echo "Refusing deploy: $name is not checked out on main" >&2
    exit 1
  fi
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "Refusing deploy: $name checkout has local changes" >&2
    git status --short >&2
    exit 1
  fi

  git pull --ff-only
  local local_sha remote_sha
  local_sha="$(git rev-parse HEAD)"
  remote_sha="$(git rev-parse origin/main)"
  if [[ "$local_sha" != "$remote_sha" ]]; then
    echo "Refusing deploy: $name HEAD does not match origin/main" >&2
    exit 1
  fi
  echo "  $name commit: $local_sha"
}

update_repo "backend" "$ROOT/backend"
cd "$ROOT/backend"
npm ci
npx prisma generate
npx prisma migrate deploy      # applies schema; does NOT seed
npm run build

update_repo "frontend" "$ROOT/frontend"
cd "$ROOT/frontend"
npm ci

# Publish only newly added source-controlled docs. Existing rows are left
# untouched so edits made through the CMS remain authoritative.
cd "$ROOT/backend"
npm run import:standalone -- --create-only

cd "$ROOT/frontend"
# NEXT_PUBLIC_* is inlined at build time; keep it same-origin for production.
NEXT_PUBLIC_API_URL="/api" npm run build

echo "==> Reload PM2"
pm2 startOrReload "$ROOT/frontend/deploy/ecosystem.config.js"
pm2 save

echo "==> Health checks"
curl --fail --silent --show-error --retry 10 --retry-delay 2 --retry-connrefused \
  "http://127.0.0.1:3001/api/documents" >/dev/null
curl --fail --silent --show-error --retry 10 --retry-delay 2 --retry-connrefused \
  "http://127.0.0.1:3000/" >/dev/null

echo "==> Done. Web on :3000, API on :3001 (nginx proxies both)."
