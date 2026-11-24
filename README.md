# Upolabdhi — React + Vite + Next.js

The existing Upolabdhi React single-page application is served by Vite during frontend-only development. The inventory workspace and its authentication/API routes run in Next.js.

## Run

1. Install Node.js 20.19+ (or 22.12+) and pnpm.
2. Run `pnpm install`.
3. Use `pnpm dev` for the Vite frontend (http://localhost:3000), or `pnpm dev:inventory` for the inventory workspace and admin login (http://localhost:3001/inventory).
4. For local admin login, configure the MongoDB, admin, authentication-secret, and email API variables from `render.yaml` in `.env.local`.
5. Run `pnpm build:inventory` to build the Next.js application.

## Render deployment

The Render blueprint runs Next.js as a Node web service so the inventory login, OTP verification, and other `/api` routes are available. Set the environment variables marked `sync: false` in the Render dashboard; `.env.local` is only used for local development. The catch-all Next.js page keeps React Router routes working on refresh.

## Backend note

Vite serves only the frontend and proxies `/api` to `VITE_API_BASE_URL`. The Next.js server provides the inventory APIs and admin authentication. Do not place private AI provider keys in browser code.
