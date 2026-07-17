# Deploying jdesk.dev (SSR + API)

The site is now **server-rendered**: a Next.js server reads content from the
NestJS + SQLite CMS on each request. So the VPS runs **two Node processes**
behind nginx:

```
nginx (jdesk.dev, 443)
├── /       → Next.js SSR   (127.0.0.1:3000)
└── /api/   → NestJS API    (127.0.0.1:3001)  ── SQLite (prod.db)
```

VPS layout used throughout: `/var/www/jdesk/{frontend,backend}`.

## 1. DNS

| Type | Host | Value |
| ---- | ---- | ---------------- |
| A    | `@`  | `103.75.183.164` |
| A    | `www`| `103.75.183.164` |

## 2. One-time server setup (on the VPS)

```bash
# Node 20+, nginx, git, pm2, certbot
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx git certbot python3-certbot-nginx
npm i -g pm2

mkdir -p /var/www/jdesk && cd /var/www/jdesk
git clone https://github.com/tuanworlddev/jdesk-frontend.git frontend
git clone https://github.com/tuanworlddev/jdesk-backend.git  backend   # see note below

# --- backend ---
cd /var/www/jdesk/backend
cp .env.production.example .env      # then edit: JWT_SECRET, ADMIN_PASSWORD, DATABASE_URL
npm ci
npx prisma migrate deploy
npm run seed                         # FIRST TIME ONLY — creates admin, docs, content
npm run import:standalone            # imports the extra markdown docs
npm run build

# --- frontend ---
cd /var/www/jdesk/frontend
npm ci
NEXT_PUBLIC_API_URL=/api npm run build

# --- pm2 (both apps) ---
pm2 startOrReload /var/www/jdesk/frontend/deploy/ecosystem.config.js
pm2 save
pm2 startup          # run the command it prints so PM2 survives reboot

# --- nginx ---
cp /var/www/jdesk/frontend/deploy/nginx-jdesk.conf /etc/nginx/sites-available/jdesk.dev
ln -sf /etc/nginx/sites-available/jdesk.dev /etc/nginx/sites-enabled/jdesk.dev
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

## 3. HTTPS

After DNS resolves (`dig +short jdesk.dev`):

```bash
certbot --nginx -d jdesk.dev -d www.jdesk.dev
```

## 4. CI/CD (auto-deploy on push)

`.github/workflows/deploy.yml` lints + builds on every push/PR, and on push to
`main` deploys over SSH using a **key** (never a password).

1. Generate a deploy keypair (on your machine, not the server):
   ```bash
   ssh-keygen -t ed25519 -f jdesk_deploy -N ""
   ```
2. Add the **public** key to the VPS: append `jdesk_deploy.pub` to
   `/root/.ssh/authorized_keys`.
3. Add GitHub repo secrets (Settings → Secrets → Actions) on **jdesk-frontend**:
   - `SSH_PRIVATE_KEY` — contents of `jdesk_deploy` (the private key)
   - `SSH_HOST` — `103.75.183.164`
   - `SSH_USER` — `root` (better: a dedicated deploy user)
4. Push to `main` → the workflow SSHes in and runs
   `deploy.sh` (pulls both repos, rebuilds, runs `prisma migrate deploy`,
   imports only newly added source-controlled docs, and reloads PM2). It
   **never re-seeds or overwrites existing CMS rows**, so admin edits are
   preserved. The deploy fails if either checkout is not on `main`, contains
   local changes, or does not match `origin/main`; it also health-checks both
   Node processes after the PM2 reload.

## 5. Manual redeploy

```bash
bash /var/www/jdesk/frontend/deploy/deploy.sh
```

## Notes

- **Backend repo.** The backend lives in `backend/` and is initialized as its
  own git repo. Create `github.com/tuanworlddev/jdesk-backend` and push it so
  the VPS can clone/pull it. (`deploy.sh` runs `git pull` in both.)
- **Env vars.** `NEXT_PUBLIC_API_URL=/api` is baked in at build; the SSR server
  reaches the backend via `API_INTERNAL_URL=http://127.0.0.1:3001/api` (set in
  the PM2 config). Backend secrets live in `backend/.env`.
- **Database.** SQLite `prod.db` lives in `backend/`. Back it up regularly
  (`cp prod.db backups/…`). It is gitignored. Deploys run
  `npm run import:standalone -- --create-only`: new official docs are created,
  while existing CMS content is left untouched.
- **Security.** Change the seeded admin password immediately, and set a strong
  `JWT_SECRET`.
- **Clean checkouts.** Do not edit tracked files directly in
  `/var/www/jdesk/{frontend,backend}`. Commit changes through GitHub; a dirty
  checkout intentionally blocks deployment instead of silently building stale
  code.
