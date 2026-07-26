# UI + GraphQL Update Notes

## Landing page

Updated `frontend-apps/00-portfolio-index/index.html` to use a lighter visual tone, larger typography, and the current deployed Vercel app links:

- `https://salesforce-agentforce-profile.vercel.app/`
- `https://salesforce-agentforce-chat.vercel.app/`
- `https://salesforce-agentforce-analytics.vercel.app/`

This is still a static HTML folder. No build command is needed in Vercel.

## Commerce Analytics Console

Updated `frontend-apps/03-agentforce-commerce-analytics/src/routes/index.tsx` to fix the GraphQL code-rendering bug.

The original GraphQL highlighter used `dangerouslySetInnerHTML` and then repeatedly performed regex replacements against already-inserted HTML. That allowed style attributes such as `color:var(...)` to appear inside the visible code block.

The new version renders GraphQL using React token spans instead of injecting HTML, so the query displays as GraphQL syntax rather than JSX/HTML fragments.

## Live GraphQL proxy test

Added a new panel named **Live Salesforce GraphQL Proxy Test**. It calls:

```text
POST {VITE_BACKEND_PROXY_URL}/api/salesforce/graphql
```

with a controlled Salesforce GraphQL UI API query against Account records. This mirrors the secure backend proxy pattern already proven by App 1.

## Deployment order

1. Copy the changed files into the existing local repo.
2. Commit and push to GitHub.
3. Vercel should automatically redeploy the landing page and Commerce Analytics Console projects.
4. If either does not redeploy automatically, use Vercel → Deployments → Redeploy.
5. Confirm the `VITE_BACKEND_PROXY_URL` variable exists in the Commerce Analytics Vercel project.
6. Confirm Railway CORS allows `https://salesforce-agentforce-analytics.vercel.app`.
