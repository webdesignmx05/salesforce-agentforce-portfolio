# Portfolio Index Landing Page

This optional static landing page now uses the sleeker Lovable-generated design from `index(1).html`, including the Tailwind browser script and Font Awesome icons.

The only intentional change is the link strategy:

- The original Lovable file linked to local build paths such as `./01-agentforce-unified-profile/dist/index.html`.
- That path does **not** match the recommended deployment approach, because the three TanStack Start apps should be deployed as separate Vercel projects.
- Therefore, the active `index.html` preserves the Lovable look and feel but replaces those local `dist` links with placeholder Vercel URLs.

After the three app deployments are live, edit `index.html` and replace:

```text
https://REPLACE-WITH-UNIFIED-PROFILE-VERCEL-URL
https://REPLACE-WITH-AGENTFORCE-CHAT-VERCEL-URL
https://REPLACE-WITH-COMMERCE-ANALYTICS-VERCEL-URL
```

Recommended Vercel Root Directory for this static landing page:

```text
frontend-apps/00-portfolio-index
```

No build command is needed for this static HTML folder.

Reference files included:

```text
index.original-lovable-relative-links.html  # exact original visual file, before deployment-safe link edits
index.placeholder-generated.html           # previous placeholder landing page, kept only for comparison
```
