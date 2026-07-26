# Agentforce Commerce Analytics Command Center

React/TanStack Start portfolio app generated from the Lovable UI export.

## Update notes

This version corrects the GraphQL code rendering issue by removing the fragile `dangerouslySetInnerHTML` GraphQL highlighter. The query is now rendered with safe React token spans, preventing JSX/HTML fragments from appearing inside the code panel.

The visible GraphQL query was also simplified to a safer Salesforce GraphQL UI API test query:

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

A new **Live Salesforce GraphQL Proxy Test** panel calls:

```text
POST {VITE_BACKEND_PROXY_URL}/api/salesforce/graphql
```

This keeps Salesforce credentials in Railway and proves the browser-to-Railway-to-Salesforce GraphQL path when:

- `VITE_BACKEND_PROXY_URL` is set in the Vercel project
- `SALESFORCE_ENABLE_LIVE=true` is set in Railway
- the backend proxy has valid Salesforce OAuth settings

The lower analytics dashboard remains simulated until real Salesforce/commerce objects are intentionally mapped into the dashboard UI.
