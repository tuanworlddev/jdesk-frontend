# Deploying jdesk.dev

The site is a **fully static** Next.js 16 export (`output: "export"` in
`next.config.ts`). `npm run build` produces a self-contained `out/` directory —
plain HTML/CSS/JS you can serve from any static web server. No Node.js is needed
at runtime.

## 1. DNS

Point the domain at the VPS (`103.75.183.164`):

| Type | Host | Value |
| ---- | ---- | -------------- |
| A    | `@`  | `103.75.183.164` |
| A    | `www`| `103.75.183.164` |

## 2. One-time server setup (on the VPS)

```bash
# Node 20+ (Next.js 16 requires it), nginx, git, certbot
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx git certbot python3-certbot-nginx

git clone https://github.com/tuanworlddev/jdesk-frontend.git /var/www/jdesk-frontend
cd /var/www/jdesk-frontend
npm ci
npm run build            # -> /var/www/jdesk-frontend/out

# nginx site
cp deploy/nginx-jdesk.conf /etc/nginx/sites-available/jdesk.dev
ln -sf /etc/nginx/sites-available/jdesk.dev /etc/nginx/sites-enabled/jdesk.dev
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

## 3. HTTPS

After DNS has propagated (check with `dig +short jdesk.dev`):

```bash
certbot --nginx -d jdesk.dev -d www.jdesk.dev
```

Certbot edits the nginx config to add the 443 server block and auto-renews.

## 4. Redeploy after a change

```bash
cd /var/www/jdesk-frontend
git pull
npm ci
npm run build
systemctl reload nginx     # only needed if the nginx config itself changed
```

> Tip: put steps 4 in a `deploy.sh` on the VPS, or wire a GitHub Actions
> workflow that SSHes in and runs it on every push to `main`.

## Notes

- Static export writes `docs/introduction.html`, so the nginx `try_files`
  directive in `deploy/nginx-jdesk.conf` maps `/docs/introduction` →
  `docs/introduction.html`. Keep it.
- The social card is prerendered to `out/opengraph-image`; `metadataBase` is
  `https://jdesk.dev`, so share URLs resolve correctly.
- `sitemap.xml` and `robots.txt` are generated into `out/` at build time.
