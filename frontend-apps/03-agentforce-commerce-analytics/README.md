# Agentforce Commerce Analytics Command Center

React/TanStack Start portfolio app generated from the Lovable UI export.

## Update notes

This version corrects the GraphQL code rendering issue by removing the fragile `dangerouslySetInnerHTML` GraphQL highlighter. The query is rendered with safe React token spans, preventing JSX/HTML fragments from appearing inside the code panel.

The visible GraphQL query is a controlled Salesforce GraphQL UI API test query against Account records:

```graphql
query SalesforceAccountIntel {
  uiapi {
    query {
      Account(first: 5) {
        edges {
          node {
            Id
            Name { value }
            Industry { value }
            Type { value }
            Website { value }
          }
        }
      }
    }
  }
}
```

A **Live Salesforce GraphQL Proxy Test** panel calls:

```text
POST {VITE_BACKEND_PROXY_URL}/api/salesforce/graphql
```

This keeps Salesforce credentials in Railway and proves the browser-to-Railway-to-Salesforce GraphQL path when:

- `VITE_BACKEND_PROXY_URL` is set in the Vercel project
- `SALESFORCE_ENABLE_LIVE=true` is set in Railway
- the backend proxy has valid Salesforce OAuth settings

## Controlled interactivity

The live GraphQL panel includes allowlisted preset buttons for 3, 5, or 10 Account records. These buttons update the displayed GraphQL query and rerun a controlled Salesforce GraphQL request. This demonstrates GraphQL interactivity without exposing a raw public query editor.

The response footer also changes after a successful test:

```text
response body · live Salesforce GraphQL response
```

The lower analytics dashboard remains simulated until real Salesforce/commerce objects are intentionally mapped into the dashboard UI.
