# Local Testing

You can test each piece independently.

## Backend proxy

```bash
cd backend-proxy
cp .env.example .env
npm install
npm run dev
```

Open:

```text
http://localhost:3000/health
```

## Unified Profile app

```bash
cd frontend-apps/01-unified-profile
cp .env.example .env
npm install
npm run dev
```

## Guardrail Chat app

```bash
cd frontend-apps/02-agentforce-guardrail-chat
cp .env.example .env
npm install
npm run dev
```

## Commerce Analytics app

```bash
cd frontend-apps/03-agentforce-commerce-analytics
cp .env.example .env
npm install
npm run dev
```

## Root workspace shortcuts

From the repo root, after installing dependencies, you can also run:

```bash
npm run dev:backend
npm run dev:unified
npm run dev:chat
npm run dev:analytics
```

Use separate terminal windows for multiple services.
