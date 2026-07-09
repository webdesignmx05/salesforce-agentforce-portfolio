import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3000;
const liveMode = String(process.env.SALESFORCE_ENABLE_LIVE || 'false').toLowerCase() === 'true';
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Blocked by CORS: ${origin}`));
  },
}));

let cachedToken = null;

function missingSalesforceConfig() {
  const required = ['SALESFORCE_LOGIN_URL', 'SALESFORCE_CLIENT_ID', 'SALESFORCE_CLIENT_SECRET'];
  return required.filter((key) => !process.env[key] || process.env[key].startsWith('REPLACE_'));
}

async function getSalesforceToken() {
  if (!liveMode) {
    throw new Error('Salesforce live mode is disabled. Set SALESFORCE_ENABLE_LIVE=true after credentials are ready.');
  }

  const missing = missingSalesforceConfig();
  if (missing.length) {
    throw new Error(`Missing Salesforce environment variables: ${missing.join(', ')}`);
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken;

  const loginUrl = process.env.SALESFORCE_LOGIN_URL.replace(/\/$/, '');
  const params = new URLSearchParams();
  params.set('grant_type', process.env.SALESFORCE_GRANT_TYPE || 'client_credentials');
  params.set('client_id', process.env.SALESFORCE_CLIENT_ID);
  params.set('client_secret', process.env.SALESFORCE_CLIENT_SECRET);

  const response = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Salesforce token request failed (${response.status}): ${JSON.stringify(payload)}`);
  }

  cachedToken = {
    accessToken: payload.access_token,
    instanceUrl: payload.instance_url || process.env.SALESFORCE_INSTANCE_URL,
    expiresAt: now + 50 * 60 * 1000,
  };
  return cachedToken;
}

function mockUnifiedProfile() {
  return {
    mode: 'mock',
    profile: {
      name: 'Maya Henderson',
      email: 'maya.henderson@example.com',
      segment: 'High-Value Household',
      engagementScore: 94,
      lifetimeValue: '$8,420',
      lastIngestedEvent: new Date().toISOString(),
    },
    activities: [
      { type: 'Cart Add', detail: 'Premium hydration bundle', timestamp: new Date().toISOString() },
      { type: 'Email Click', detail: 'Spring replenishment offer', timestamp: new Date(Date.now() - 3600_000).toISOString() },
      { type: 'Profile Merge', detail: 'Unified duplicate contact records', timestamp: new Date(Date.now() - 7200_000).toISOString() },
    ],
  };
}

function mockAgentReply(message = '') {
  return {
    mode: 'mock',
    answer: `Mock Agentforce response: I reviewed the trusted CRM and Data Cloud signals for “${message || 'your request'}” and found a high-confidence next action.` ,
    status: 'Guardrails Enforced',
    groundingSources: ['Data Cloud DMO', 'Standard SOQL Contact Record', 'Opportunity Summary', 'Case History'],
  };
}

function mockGraphQLAnalytics() {
  return {
    mode: 'mock',
    querySpeedMs: 42,
    kpis: {
      aiClosedWonRevenue: '$248K',
      agentHandoffsActive: 17,
      atRiskAccounts: 6,
    },
    records: [
      { id: '001-MOCK-001', name: 'Northstar Retail Group', category: 'High Value Leads', value: 125000 },
      { id: '001-MOCK-002', name: 'Blue River Logistics', category: 'At-Risk Accounts', value: 84000 },
      { id: '001-MOCK-003', name: 'Metro Home Services', category: 'Expansion Ready', value: 67000 },
    ],
  };
}

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'agentforce-backend-proxy',
    liveMode,
    timestamp: new Date().toISOString(),
  });
});

// Safe callback placeholder. Update your Salesforce Connected App callback URL to this Railway route if you use web server OAuth flow later.
app.get('/oauth/callback', (req, res) => {
  res.status(200).send(`
    <html><body style="font-family: system-ui; padding: 32px; max-width: 760px;">
      <h1>Salesforce OAuth Callback Reached</h1>
      <p>This confirms Salesforce can redirect to your Railway backend.</p>
      <p>This starter proxy is currently designed for mock mode and optional server-to-server token testing.</p>
      <pre>${JSON.stringify({ query: req.query }, null, 2)}</pre>
    </body></html>
  `);
});

app.get('/api/demo/unified-profile', (req, res) => res.json(mockUnifiedProfile()));
app.post('/api/demo/agent-chat', (req, res) => res.json(mockAgentReply(req.body?.message)));
app.post('/api/demo/graphql-analytics', (req, res) => res.json(mockGraphQLAnalytics()));

// Live SOQL proxy example. Keep disabled until you intentionally enable SALESFORCE_ENABLE_LIVE=true.
app.post('/api/salesforce/soql', async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing required string body field: query' });
    }
    if (!liveMode) {
      return res.json({
        mode: 'mock',
        note: 'Live Salesforce mode is disabled. This proves your frontend/backend path without risking credentials.',
        requestedQuery: query,
        sample: mockUnifiedProfile(),
      });
    }

    const token = await getSalesforceToken();
    const apiVersion = process.env.SALESFORCE_API_VERSION || 'v64.0';
    const url = `${token.instanceUrl}/services/data/${apiVersion}/query/?q=${encodeURIComponent(query)}`;
    const sfResponse = await fetch(url, {
      headers: { Authorization: `Bearer ${token.accessToken}` },
    });
    const payload = await sfResponse.json();
    return res.status(sfResponse.status).json(payload);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Live GraphQL proxy example. Endpoint may vary by org/API version; validate in your Salesforce org before enabling.
app.post('/api/salesforce/graphql', async (req, res) => {
  try {
    const { query, variables } = req.body || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing required string body field: query' });
    }
    if (!liveMode) {
      return res.json({
        mode: 'mock',
        note: 'Live Salesforce mode is disabled. Returning simulated GraphQL analytics.',
        requestedQuery: query,
        variables: variables || {},
        sample: mockGraphQLAnalytics(),
      });
    }

    const token = await getSalesforceToken();
    const apiVersion = process.env.SALESFORCE_API_VERSION || 'v64.0';
    const url = `${token.instanceUrl}/services/data/${apiVersion}/graphql`;
    const sfResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: variables || {} }),
    });
    const payload = await sfResponse.json();
    return res.status(sfResponse.status).json(payload);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Agentforce backend proxy listening on 0.0.0.0:${PORT}`);
  console.log(`Salesforce live mode: ${liveMode ? 'ON' : 'OFF / MOCK'}`);
});
