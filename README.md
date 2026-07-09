# Salesforce Agentforce React Portfolio

This repo contains a practical portfolio build based on three Lovable-generated React/Tailwind apps plus a secure backend proxy scaffold.

## What is inside

```text
salesforce-agentforce-portfolio/
├── frontend-apps/
│   ├── 00-portfolio-index/              # Optional static Lovable-style landing page linking to deployed apps
│   ├── 01-unified-profile/              # TanStack Start React app
│   ├── 02-agentforce-guardrail-chat/    # TanStack Start React app
│   └── 03-agentforce-commerce-analytics/# TanStack Start React app
├── backend-proxy/                       # Express API proxy for Railway
├── docs/                                # Step-by-step deployment/config notes
├── package.json                         # Convenience workspace scripts
└── .gitignore
```

## Recommended architecture

Use one GitHub repo, but create separate deployable services:

1. **Vercel Project 1** → `frontend-apps/01-unified-profile`
2. **Vercel Project 2** → `frontend-apps/02-agentforce-guardrail-chat`
3. **Vercel Project 3** → `frontend-apps/03-agentforce-commerce-analytics`
4. **Optional Vercel Project 4** → `frontend-apps/00-portfolio-index`
5. **Railway Service** → `backend-proxy`

This keeps the polished React apps inexpensive on Vercel while using Railway only for the secure backend proxy that protects Salesforce credentials.

## Important finding from the Lovable exports

The three Lovable ZIPs are **TanStack Start** apps, not simple static Vite apps. That is why treating them like normal `index.html` static folders can cause deployment confusion. Each app should be deployed from its own root directory.


## Portfolio index clarification

The optional `frontend-apps/00-portfolio-index/index.html` file uses the sleeker Lovable-generated landing page design. The design was preserved, but its original local `dist/index.html` links were changed to placeholder Vercel URLs because each Lovable React app should be deployed as its own Vercel project.

After Vercel gives you the three production app URLs, open `frontend-apps/00-portfolio-index/index.html` and replace the three `REPLACE-WITH-*` links.

## Current status

The frontend apps are intentionally mock-first. They can be deployed without Salesforce credentials. The backend proxy also starts in mock mode so you can prove GitHub → Vercel → Railway deployment before touching real Salesforce API wiring.

## Start here

Open:

```text
docs/STEP_BY_STEP_DEPLOYMENT.md
```
