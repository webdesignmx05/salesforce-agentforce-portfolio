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
