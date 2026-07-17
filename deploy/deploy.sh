#!/usr/bin/env bash
# Idempotent deploy for the VPS. Pulls latest, builds both apps, applies DB
# migrations (never re-seeds — that would overwrite admin edits), and reloads
# PM2. Run manually or via the GitHub Actions deploy job.
set -euo pipefail

ROOT="${JDESK_ROOT:-/var/www/jdesk}"

echo "==> Backend"
cd "$ROOT/backend"
git pull --ff-only || echo "  (skip git pull)"
npm ci
npx prisma generate
npx prisma migrate deploy      # applies schema; does NOT seed
npm run build

echo "==> Frontend"
cd "$ROOT/frontend"
git pull --ff-only || echo "  (skip git pull)"
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

echo "==> Done. Web on :3000, API on :3001 (nginx proxies both)."
