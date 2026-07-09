# Troubleshooting

## Vercel shows 404 or blank page

Check these first:

1. Root Directory is set to the specific app folder, not repo root.
2. `NITRO_PRESET=vercel` is set in that Vercel project.
3. Build Command is `npm run build`.
4. Output Directory is blank / automatic.
5. Redeploy without build cache after changing framework/build settings.

## Vercel says it cannot find package.json

The Root Directory is probably wrong. Use one of these:

```text
frontend-apps/01-unified-profile
frontend-apps/02-agentforce-guardrail-chat
frontend-apps/03-agentforce-commerce-analytics
```

## Railway app fails to respond

Check that the backend binds to Railway's injected `PORT`. The included Express server already uses `process.env.PORT` and binds to `0.0.0.0`.

## Browser CORS error

Add the Vercel URL to Railway's `CORS_ORIGIN` variable. Use comma-separated URLs with no spaces if possible.

## Salesforce token request fails

Keep `SALESFORCE_ENABLE_LIVE=false` until you have confirmed the Connected App settings and environment variables. Then test `/health` first before testing any Salesforce endpoint.

## Do not paste secrets into Vercel

Only `VITE_*` values belong in frontend apps. Salesforce Consumer Secret belongs only in Railway.
