# Backend Proxy

This Railway service keeps Salesforce credentials out of the browser.

## First deployment target

Deploy this folder to Railway with the GitHub repo connected and the service root set to:

```text
backend-proxy
```

## Start command

```text
npm start
```

## Safe first environment variables

Start in mock mode first:

```text
NODE_ENV=production
SALESFORCE_ENABLE_LIVE=false
CORS_ORIGIN=https://YOUR-APP-01.vercel.app,https://YOUR-APP-02.vercel.app,https://YOUR-APP-03.vercel.app
```

Then open:

```text
https://YOUR-RAILWAY-URL.up.railway.app/health
```

When that works, update Salesforce and add real secrets.

## Real Salesforce values later

```text
SALESFORCE_ENABLE_LIVE=true
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_CLIENT_ID=your_consumer_key
SALESFORCE_CLIENT_SECRET=your_consumer_secret
SALESFORCE_GRANT_TYPE=client_credentials
SALESFORCE_INSTANCE_URL=https://your-domain.my.salesforce.com
SALESFORCE_API_VERSION=v64.0
```

Do not commit real secrets to GitHub.

## Controlled GraphQL endpoint

The Commerce Analytics app should use the controlled endpoint below instead of a raw public GraphQL passthrough:

```text
POST /api/salesforce/graphql/account-query
```

Expected body:

```json
{
  "limit": 5,
  "industry": "all",
  "accountType": "all",
  "fieldMode": "basic"
}
```

The backend validates those controls and rebuilds the Salesforce Account GraphQL query server-side. This keeps the public demo interactive while limiting it to an allowlisted Account query pattern.

Keep raw GraphQL disabled for the public portfolio unless you intentionally need it for private development:

```text
SALESFORCE_ALLOW_RAW_GRAPHQL=false
```

## Controlled Unified Profile SOQL endpoint

The Unified Profile app should use this controlled endpoint instead of allowing raw SOQL from the public browser UI:

```text
POST /api/salesforce/profile-query
```

Expected body:

```json
{
  "queryKey": "accounts",
  "limit": 5
}
```

Allowed `queryKey` values:

```text
accounts
contacts
opportunities
cases
```

Allowed `limit` values:

```text
3, 5, 10
```

The backend validates those controls, builds the SOQL query server-side, calls Salesforce, and returns sanitized record fields for the frontend modal overlays. This keeps the demo interactive without letting site visitors submit arbitrary SOQL against the Salesforce org.
