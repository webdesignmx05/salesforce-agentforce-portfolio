# Configuration Values You Must Update

## GitHub

```text
YOUR-USERNAME
```

Used in the Git remote URL if pushing by terminal.

## Vercel App URLs

After Vercel deploys each app, record the production URLs here:

```text
APP_01_UNIFIED_PROFILE_URL=
APP_02_AGENTFORCE_CHAT_URL=
APP_03_COMMERCE_ANALYTICS_URL=
APP_04_PORTFOLIO_INDEX_URL=
```

## Railway Backend URL

After Railway deploys the backend proxy, record:

```text
RAILWAY_BACKEND_URL=
```

Use this value in Vercel as:

```text
VITE_BACKEND_PROXY_URL=RAILWAY_BACKEND_URL
```

Use this value in Salesforce as:

```text
Callback URL = RAILWAY_BACKEND_URL/oauth/callback
```

## Railway Secrets Only

These belong only in Railway Variables:

```text
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_INSTANCE_URL=
SALESFORCE_API_VERSION=v64.0
```

## CORS Origin

In Railway, set `CORS_ORIGIN` to the Vercel app URLs that are allowed to call the proxy:

```text
CORS_ORIGIN=https://APP-01.vercel.app,https://APP-02.vercel.app,https://APP-03.vercel.app
```

If the landing page eventually calls the backend directly, add it too.
