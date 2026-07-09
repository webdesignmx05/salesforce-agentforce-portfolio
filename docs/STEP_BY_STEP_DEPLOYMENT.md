# Step-by-Step Deployment and Configuration Guide

## Phase 1 — Unzip and create the GitHub repo

1. Unzip `salesforce-agentforce-portfolio-final.zip` on your computer.
2. Open the unzipped folder named `salesforce-agentforce-portfolio`.
3. Create a new empty GitHub repository named:

```text
salesforce-agentforce-portfolio
```

4. Push the folder to GitHub using GitHub Desktop or terminal.

Terminal option:

```bash
cd salesforce-agentforce-portfolio
git init
git add .
git commit -m "Initial Agentforce React portfolio monorepo"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/salesforce-agentforce-portfolio.git
git push -u origin main
```

Do not add Salesforce secrets to the repo.

---

## Phase 2 — Deploy the three frontend apps to Vercel

Create three separate Vercel projects from the same GitHub repo.

### App 1: Unified Profile

Vercel project settings:

```text
Root Directory: frontend-apps/01-unified-profile
Build Command: npm run build
Install Command: npm install
Development Command: npm run dev
Output Directory: leave blank / automatic
```

Environment variables:

```text
NITRO_PRESET=vercel
VITE_BACKEND_PROXY_URL=
```

Leave `VITE_BACKEND_PROXY_URL` blank until the Railway backend has a public URL.

### App 2: Guardrail Chat

```text
Root Directory: frontend-apps/02-agentforce-guardrail-chat
Build Command: npm run build
Install Command: npm install
Development Command: npm run dev
Output Directory: leave blank / automatic
```

Environment variables:

```text
NITRO_PRESET=vercel
VITE_BACKEND_PROXY_URL=
```

### App 3: Commerce Analytics

```text
Root Directory: frontend-apps/03-agentforce-commerce-analytics
Build Command: npm run build
Install Command: npm install
Development Command: npm run dev
Output Directory: leave blank / automatic
```

Environment variables:

```text
NITRO_PRESET=vercel
VITE_BACKEND_PROXY_URL=
```

### What to test after each app deploys

Open each Vercel URL. The apps should render with mock data even without Salesforce live wiring.

Do not deploy all four things at once. Deploy App 1 first, confirm it loads, then App 2, then App 3.

---

## Phase 3 — Deploy the Railway backend proxy

Create one Railway service from the same GitHub repository.

Railway service settings:

```text
Root Directory: backend-proxy
Start Command: npm start
```

Initial Railway variables:

```text
NODE_ENV=production
SALESFORCE_ENABLE_LIVE=false
CORS_ORIGIN=https://APP-01.vercel.app,https://APP-02.vercel.app,https://APP-03.vercel.app
```

After Railway deploys, open:

```text
https://YOUR-RAILWAY-URL.up.railway.app/health
```

You should see a JSON response showing `ok: true` and `liveMode: false`.

---

## Phase 4 — Update Vercel frontend variables after Railway exists

Go back into each Vercel project and set:

```text
VITE_BACKEND_PROXY_URL=https://YOUR-RAILWAY-URL.up.railway.app
```

Redeploy each Vercel project after adding the variable.

This does not make Salesforce live yet. It only prepares the browser apps to call your Railway proxy later.

---

## Phase 5 — Update Salesforce Connected App callback URL

Only update the Salesforce callback URL after Railway has a public URL.

Recommended callback URL:

```text
https://YOUR-RAILWAY-URL.up.railway.app/oauth/callback
```

Use the Railway backend callback, not the Vercel frontend app URL, because Salesforce credentials should terminate on the backend.

Keep your existing Connected App scopes aligned with the APIs you plan to test. Do not paste your Consumer Secret into React or Vercel client code.

---

## Phase 6 — Add Salesforce secrets to Railway only

Add these variables in Railway, not GitHub and not Vercel:

```text
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_CLIENT_ID=your_consumer_key
SALESFORCE_CLIENT_SECRET=your_consumer_secret
SALESFORCE_INSTANCE_URL=https://your-domain.my.salesforce.com
SALESFORCE_API_VERSION=v64.0
```

Leave this as false until you intentionally test live calls:

```text
SALESFORCE_ENABLE_LIVE=false
```

When ready, flip it to:

```text
SALESFORCE_ENABLE_LIVE=true
```

Then test one backend endpoint at a time.

---

## Phase 7 — Optional landing page

After you have three working Vercel URLs, edit:

```text
frontend-apps/00-portfolio-index/index.html
```

Replace these placeholders:

```text
https://REPLACE-WITH-UNIFIED-PROFILE-VERCEL-URL
https://REPLACE-WITH-AGENTFORCE-CHAT-VERCEL-URL
https://REPLACE-WITH-COMMERCE-ANALYTICS-VERCEL-URL
https://REPLACE-WITH-RAILWAY-BACKEND-URL.up.railway.app
```

Then deploy the landing page as a fourth Vercel project:

```text
Root Directory: frontend-apps/00-portfolio-index
Build Command: leave blank
Output Directory: leave blank
```

---

## Recommended order of operations

1. Push repo to GitHub.
2. Deploy App 1 to Vercel and confirm visual render.
3. Deploy App 2 to Vercel and confirm visual render.
4. Deploy App 3 to Vercel and confirm visual render.
5. Deploy Railway backend in mock mode.
6. Add Railway URL to each Vercel project as `VITE_BACKEND_PROXY_URL`.
7. Update Salesforce Connected App callback URL to Railway `/oauth/callback`.
8. Add Salesforce secrets to Railway only.
9. Test backend live mode carefully.
10. Wire individual frontend components to the backend proxy later.

This avoids the previous failure pattern: changing package files and deployment settings repeatedly before the baseline mock apps were proven live.
