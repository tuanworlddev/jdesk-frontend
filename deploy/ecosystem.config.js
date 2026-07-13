// PM2 process manager — runs the NestJS API and the Next.js SSR server.
// Assumes the VPS layout /var/www/jdesk/{frontend,backend}. Start with:
//   pm2 startOrReload /var/www/jdesk/frontend/deploy/ecosystem.config.js
//   pm2 save && pm2 startup

module.exports = {
  apps: [
    {
      name: "jdesk-backend",
      cwd: "/var/www/jdesk/backend",
      script: "dist/main.js",
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
        // Other secrets (JWT_SECRET, ADMIN_*, DATABASE_URL) come from
        // /var/www/jdesk/backend/.env — never commit that file.
      },
    },
    {
      name: "jdesk-frontend",
      cwd: "/var/www/jdesk/frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        // Server-side SSR talks to the backend directly on localhost.
        API_INTERNAL_URL: "http://127.0.0.1:3001/api",
        // Client-side calls go same-origin; nginx proxies /api to the backend.
        NEXT_PUBLIC_API_URL: "/api",
      },
    },
  ],
};
