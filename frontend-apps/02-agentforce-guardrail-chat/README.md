# Agentforce Guardrail Chat

This folder contains the Lovable-exported React/Tailwind UI for **Agentforce Guardrail Chat**.

## Important deployment note

This is a **TanStack Start** app, not a plain static Vite app. It contains `src/server.ts`, `src/start.ts`, `src/router.tsx`, and generated route files. Deploy this folder as its own Vercel project by setting the Vercel **Root Directory** to:

```text
frontend-apps/02-agentforce-guardrail-chat
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
