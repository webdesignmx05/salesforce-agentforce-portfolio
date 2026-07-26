# Agentforce Commerce Analytics Command Center

React/TanStack Start portfolio app generated from the Lovable UI export and then enhanced for a safer live Salesforce GraphQL demonstration.

## What this version demonstrates

This app now demonstrates GraphQL’s practical value without exposing Salesforce credentials or an unrestricted public query editor:

1. **Accounts tab runs a live query** — selecting the top **Accounts** tab triggers the live Account GraphQL test through Railway if it has not already run.
2. **Field-shape control** — the **Basic / Expanded** selector changes the visible GraphQL query and result table. Expanded mode adds the related `Owner.Name` relationship.
3. **Safe query filters** — users can change record count, Industry, and Account Type using controlled selectors.

The browser calls the safer Railway endpoint:

```text
POST {VITE_BACKEND_PROXY_URL}/api/salesforce/graphql/account-query
```

The browser sends only controlled values such as:

```json
{
  "limit": 5,
  "industry": "Electronics",
  "accountType": "Customer - Direct",
  "fieldMode": "expanded"
}
```

Railway rebuilds the allowlisted Salesforce GraphQL query server-side before calling Salesforce.

## Why this is safer than a raw public GraphQL editor

The browser never receives Salesforce credentials, and the public UI does not send an arbitrary GraphQL string to Salesforce. The backend validates:

- allowed record limits: `3`, `5`, `10`
- allowed industry filters
- allowed account type filters
- allowed field modes: `basic`, `expanded`

The older raw endpoint is now disabled by default unless `SALESFORCE_ALLOW_RAW_GRAPHQL=true` is intentionally set in Railway.

## Live requirements

The live test works when:

- `VITE_BACKEND_PROXY_URL` is set in the Vercel Analytics project
- Railway has `SALESFORCE_ENABLE_LIVE=true`
- Railway has valid Salesforce OAuth client credentials
- Railway CORS includes the Analytics app domain

The lower pipeline intelligence grid remains simulated until real Salesforce opportunity or commerce objects are intentionally mapped into the dashboard UI.
