# Agentforce Unified Profile

This folder contains the Lovable-exported React/Tailwind UI for **Agentforce Unified Profile**.

## Important deployment note

This is a **TanStack Start** app, not a plain static Vite app. It contains `src/server.ts`, `src/start.ts`, `src/router.tsx`, and generated route files. Deploy this folder as its own Vercel project by setting the Vercel **Root Directory** to:

```text
frontend-apps/01-unified-profile
```

Recommended Vercel environment variables:

```text
NITRO_PRESET=vercel
VITE_BACKEND_PROXY_URL=https://YOUR-RAILWAY-BACKEND-URL.up.railway.app
```

Leave `VITE_BACKEND_PROXY_URL` blank until the Railway backend is deployed. The app currently runs with mock state and does not require Salesforce credentials.

## Local test

```bash
npm install
npm run dev
```

## Build test

```bash
npm run build
```

## Live Salesforce Account Panel

This app now includes a `Live Salesforce Proxy Test` section in `src/routes/index.tsx`.
It reads the Vercel environment variable `VITE_BACKEND_PROXY_URL` and calls:

```text
POST {VITE_BACKEND_PROXY_URL}/api/salesforce/soql
```

with this safe SOQL query:

```sql
SELECT Id, Name FROM Account LIMIT 5
```

The browser never receives Salesforce credentials. The request goes to the Railway backend proxy, and the proxy authenticates with Salesforce using Railway-only environment variables.
