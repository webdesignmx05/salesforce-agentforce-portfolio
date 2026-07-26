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

Leave `VITE_BACKEND_PROXY_URL` blank until the Railway backend is deployed. The app still contains mock profile state, but it now also includes a controlled live Salesforce query lab.

## Local test

```bash
npm install
npm run dev
```

## Build test

```bash
npm run build
```

## Controlled Live Salesforce Query Lab

This app includes a `Controlled Live Salesforce Query Lab` section in `src/routes/index.tsx`.

It reads the Vercel environment variable `VITE_BACKEND_PROXY_URL` and calls:

```text
POST {VITE_BACKEND_PROXY_URL}/api/salesforce/profile-query
```

The browser sends only allowlisted controls:

```json
{
  "queryKey": "accounts",
  "limit": 5
}
```

The Railway backend validates those controls and builds one of the approved SOQL queries server-side:

```text
accounts       -> SELECT Id, Name, Industry, Type, Website, Phone, Owner.Name FROM Account LIMIT n
contacts       -> SELECT Id, Name, Email, Title, Phone, Account.Name FROM Contact LIMIT n
opportunities  -> SELECT Id, Name, StageName, Amount, CloseDate, Account.Name FROM Opportunity LIMIT n
cases          -> SELECT Id, CaseNumber, Subject, Status, Priority, Account.Name FROM Case LIMIT n
```

The browser never receives Salesforce credentials and cannot submit arbitrary SOQL through this UI.

## Clickable drilldowns

The app now supports centered modal overlays for:

- The mock unified profile avatar/card
- Metric cards
- Unified source and identity confidence values
- Activity ingestion rows
- Live Salesforce query records returned from Railway

Mock panels are labeled as simulated profile/activity context. Live record panels are labeled as records returned through the Railway-controlled Salesforce proxy.
