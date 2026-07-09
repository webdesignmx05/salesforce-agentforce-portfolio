# Architecture Decisions

## Decision 1 — Keep the Lovable apps separate

The three Lovable exports are TanStack Start applications. They each have their own `package.json`, route tree, server entry, and app build pipeline. The safest deployment pattern is one Vercel project per app folder.

## Decision 2 — Use Vercel for visual apps

The three frontend apps are mostly visual/state-driven portfolio demos. Vercel is a good fit for this because each app can be deployed from its own root directory in the same monorepo.

## Decision 3 — Use Railway only for the backend proxy

Salesforce Consumer Secrets must not live in browser code. Railway is used for the Express proxy because it can securely store environment variables and expose a small API surface to the Vercel apps.

## Decision 4 — Mock first, live later

The first milestone is successful deployment, not full Salesforce integration. Mock-first deployment proves the folder structure, Vercel settings, Railway service, CORS, and public URLs before adding OAuth complexity.

## Decision 5 — Do not force one root build

A single root build command for all three TanStack Start apps creates unnecessary complexity. Separate Vercel projects reduce risk and are easier to troubleshoot.
