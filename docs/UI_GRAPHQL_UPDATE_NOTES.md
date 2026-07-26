# UI + GraphQL Update Notes

## Landing page

The portfolio landing page uses a lighter visual tone, larger typography, and the deployed Vercel app links:

- `https://salesforce-agentforce-profile.vercel.app/`
- `https://salesforce-agentforce-chat.vercel.app/`
- `https://salesforce-agentforce-analytics.vercel.app/`

This is still a static HTML folder. No build command is needed in Vercel.

## Commerce Analytics Console

The Commerce Analytics Console fixes the original GraphQL rendering issue by replacing fragile HTML string injection with React-rendered GraphQL token spans. The query now displays as GraphQL syntax instead of JSX/HTML fragments.

## Controlled live GraphQL demo

The Analytics app now demonstrates three GraphQL concepts safely:

1. **Accounts tab behavior** — selecting **Accounts** activates the live Account GraphQL path.
2. **Field-shape control** — Basic versus Expanded fields changes what the query asks Salesforce to return.
3. **Controlled filters** — record count, Industry, and Account Type selectors change the visible query and live request.

The app calls:

```text
POST {VITE_BACKEND_PROXY_URL}/api/salesforce/graphql/account-query
```

The browser sends only allowlisted controls. Railway validates those controls and rebuilds the Salesforce GraphQL UI API query server-side.

## Backend security change

The raw GraphQL passthrough endpoint remains in the backend code for future development, but is now disabled by default unless this Railway variable is explicitly set:

```text
SALESFORCE_ALLOW_RAW_GRAPHQL=true
```

For this public portfolio demo, keep it unset or set to:

```text
SALESFORCE_ALLOW_RAW_GRAPHQL=false
```

## Deployment order

1. Apply the patch locally.
2. Commit and push to GitHub.
3. Railway should redeploy because `backend-proxy/src/server.js` changed.
4. Vercel should redeploy the Analytics project because its App 3 source changed.
5. Confirm Railway `/health` still shows `liveMode: true`.
6. Open the Analytics app and test:
   - Accounts tab
   - Basic / Expanded fields
   - record count selector
   - Industry and Type filters
