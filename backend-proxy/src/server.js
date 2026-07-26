import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3000;
const liveMode = String(process.env.SALESFORCE_ENABLE_LIVE || 'false').toLowerCase() === 'true';
const allowRawGraphQL = String(process.env.SALESFORCE_ALLOW_RAW_GRAPHQL || 'false').toLowerCase() === 'true';
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


const PROFILE_QUERY_LIMITS = new Set([3, 5, 10]);
const PROFILE_QUERY_KEYS = new Set(['accounts', 'contacts', 'opportunities', 'cases']);

const mockProfileQueryRows = {
  accounts: [
    {
      id: '001g500000NWC7tAAH', objectType: 'Account', name: 'Edge Communications', summary: 'Electronics · Customer - Direct', source: 'Mock Account response',
      fields: { Industry: 'Electronics', Type: 'Customer - Direct', Website: 'http://edgecomm.com', Phone: '(512) 757-6000', Owner: 'M. Okafor' },
    },
    {
      id: '001g500000NWC7uAAH', objectType: 'Account', name: 'Burlington Textiles Corp of America', summary: 'Apparel · Customer - Direct', source: 'Mock Account response',
      fields: { Industry: 'Apparel', Type: 'Customer - Direct', Website: 'www.burlington.com', Phone: '(336) 222-7000', Owner: 'S. Kaur' },
    },
  ],
  contacts: [
    {
      id: '003-MOCK-001', objectType: 'Contact', name: 'Rose Gonzalez', summary: 'SVP, Procurement · Edge Communications', source: 'Mock Contact response',
      fields: { Email: 'rose.gonzalez@example.com', Title: 'SVP, Procurement', Phone: '(512) 555-0131', Account: 'Edge Communications' },
    },
    {
      id: '003-MOCK-002', objectType: 'Contact', name: 'Sean Forbes', summary: 'Director, Digital · Burlington Textiles', source: 'Mock Contact response',
      fields: { Email: 'sean.forbes@example.com', Title: 'Director, Digital', Phone: '(336) 555-0194', Account: 'Burlington Textiles Corp of America' },
    },
  ],
  opportunities: [
    {
      id: '006-MOCK-001', objectType: 'Opportunity', name: 'Edge Installation Expansion', summary: 'Negotiation · $75,000', source: 'Mock Opportunity response',
      fields: { Stage: 'Negotiation/Review', Amount: '$75,000', CloseDate: '2026-08-15', Account: 'Edge Communications' },
    },
    {
      id: '006-MOCK-002', objectType: 'Opportunity', name: 'Burlington Renewal Q3', summary: 'Proposal · $42,000', source: 'Mock Opportunity response',
      fields: { Stage: 'Proposal/Price Quote', Amount: '$42,000', CloseDate: '2026-09-01', Account: 'Burlington Textiles Corp of America' },
    },
  ],
  cases: [
    {
      id: '500-MOCK-001', objectType: 'Case', name: '00001001', summary: 'New · High priority', source: 'Mock Case response',
      fields: { Subject: 'Integration login issue', Status: 'New', Priority: 'High', Account: 'Edge Communications' },
    },
    {
      id: '500-MOCK-002', objectType: 'Case', name: '00001002', summary: 'Working · Medium priority', source: 'Mock Case response',
      fields: { Subject: 'Dashboard access request', Status: 'Working', Priority: 'Medium', Account: 'Burlington Textiles Corp of America' },
    },
  ],
};

function normalizeControlledProfileQuery(body = {}) {
  const queryKey = body.queryKey || 'accounts';
  const limit = Number(body.limit || 5);

  if (!PROFILE_QUERY_KEYS.has(queryKey)) {
    throw new Error('Invalid profile query key. Allowed values: accounts, contacts, opportunities, cases.');
  }
  if (!PROFILE_QUERY_LIMITS.has(limit)) {
    throw new Error('Invalid profile query limit. Allowed values: 3, 5, 10.');
  }

  return { queryKey, limit };
}

function buildControlledProfileSoqlQuery({ queryKey, limit }) {
  const safeQueries = {
    accounts: `SELECT Id, Name, Industry, Type, Website, Phone, Owner.Name FROM Account LIMIT ${limit}`,
    contacts: `SELECT Id, Name, Email, Title, Phone, Account.Name FROM Contact LIMIT ${limit}`,
    opportunities: `SELECT Id, Name, StageName, Amount, CloseDate, Account.Name FROM Opportunity LIMIT ${limit}`,
    cases: `SELECT Id, CaseNumber, Subject, Status, Priority, Account.Name FROM Case LIMIT ${limit}`,
  };

  return safeQueries[queryKey];
}

function moneyValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));
}

function textValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function normalizeSalesforceProfileRecord(queryKey, record) {
  if (queryKey === 'accounts') {
    return {
      id: record.Id,
      objectType: 'Account',
      name: textValue(record.Name),
      summary: `${textValue(record.Industry)} · ${textValue(record.Type)}`,
      source: 'Live Salesforce Account via Railway SOQL proxy',
      fields: {
        Industry: textValue(record.Industry),
        Type: textValue(record.Type),
        Website: textValue(record.Website),
        Phone: textValue(record.Phone),
        Owner: textValue(record.Owner?.Name),
      },
    };
  }

  if (queryKey === 'contacts') {
    return {
      id: record.Id,
      objectType: 'Contact',
      name: textValue(record.Name),
      summary: `${textValue(record.Title)} · ${textValue(record.Account?.Name)}`,
      source: 'Live Salesforce Contact via Railway SOQL proxy',
      fields: {
        Email: textValue(record.Email),
        Title: textValue(record.Title),
        Phone: textValue(record.Phone),
        Account: textValue(record.Account?.Name),
      },
    };
  }

  if (queryKey === 'opportunities') {
    return {
      id: record.Id,
      objectType: 'Opportunity',
      name: textValue(record.Name),
      summary: `${textValue(record.StageName)} · ${moneyValue(record.Amount)}`,
      source: 'Live Salesforce Opportunity via Railway SOQL proxy',
      fields: {
        Stage: textValue(record.StageName),
        Amount: moneyValue(record.Amount),
        CloseDate: textValue(record.CloseDate),
        Account: textValue(record.Account?.Name),
      },
    };
  }

  return {
    id: record.Id,
    objectType: 'Case',
    name: textValue(record.CaseNumber || record.Subject || record.Id),
    summary: `${textValue(record.Status)} · ${textValue(record.Priority)}`,
    source: 'Live Salesforce Case via Railway SOQL proxy',
    fields: {
      CaseNumber: textValue(record.CaseNumber),
      Subject: textValue(record.Subject),
      Status: textValue(record.Status),
      Priority: textValue(record.Priority),
      Account: textValue(record.Account?.Name),
    },
  };
}

function mockControlledProfileQueryResponse(controls) {
  const rows = mockProfileQueryRows[controls.queryKey].slice(0, controls.limit);
  return {
    mode: 'mock',
    requestedControls: controls,
    requestedQuery: buildControlledProfileSoqlQuery(controls),
    records: rows,
    note: 'Mock response. Enable SALESFORCE_ENABLE_LIVE=true to call Salesforce.',
  };
}


const ACCOUNT_LIMITS = new Set([3, 5, 10]);
const ACCOUNT_INDUSTRIES = new Set(['all', 'Electronics', 'Apparel', 'Construction', 'Consulting', 'Hospitality']);
const ACCOUNT_TYPES = new Set(['all', 'Customer - Direct', 'Customer - Channel']);
const ACCOUNT_FIELD_MODES = new Set(['basic', 'expanded']);

const mockAccountRows = [
  { id: '001g500000NWC7tAAH', name: 'Edge Communications', industry: 'Electronics', type: 'Customer - Direct', website: 'http://edgecomm.com', owner: 'M. Okafor' },
  { id: '001g500000NWC7uAAH', name: 'Burlington Textiles Corp of America', industry: 'Apparel', type: 'Customer - Direct', website: 'www.burlington.com', owner: 'S. Kaur' },
  { id: '001g500000NWC7vAAH', name: 'Pyramid Construction Inc.', industry: 'Construction', type: 'Customer - Channel', website: 'www.pyramid.com', owner: 'J. Chen' },
  { id: '001g500000NWC7wAAH', name: 'Dickenson plc', industry: 'Consulting', type: 'Customer - Channel', website: 'dickenson-consulting.com', owner: 'R. Alvarez' },
  { id: '001g500000NWC7xAAH', name: 'Grand Hotels & Resorts Ltd', industry: 'Hospitality', type: 'Customer - Direct', website: 'www.grandhotels.com', owner: 'M. Okafor' },
];

function normalizeControlledAccountQuery(body = {}) {
  const limit = Number(body.limit || 5);
  const industry = body.industry || 'all';
  const accountType = body.accountType || 'all';
  const fieldMode = body.fieldMode || 'basic';

  if (!ACCOUNT_LIMITS.has(limit)) {
    throw new Error('Invalid Account GraphQL limit. Allowed values: 3, 5, 10.');
  }
  if (!ACCOUNT_INDUSTRIES.has(industry)) {
    throw new Error('Invalid Account industry filter. Use one of the allowlisted values.');
  }
  if (!ACCOUNT_TYPES.has(accountType)) {
    throw new Error('Invalid Account type filter. Use one of the allowlisted values.');
  }
  if (!ACCOUNT_FIELD_MODES.has(fieldMode)) {
    throw new Error('Invalid fieldMode. Allowed values: basic, expanded.');
  }

  return { limit, industry, accountType, fieldMode };
}

function graphQLString(value) {
  return JSON.stringify(String(value));
}

function buildControlledAccountGraphQLQuery({ limit, industry, accountType, fieldMode }) {
  const filters = [
    industry !== 'all' ? `Industry: { eq: ${graphQLString(industry)} }` : null,
    accountType !== 'all' ? `Type: { eq: ${graphQLString(accountType)} }` : null,
  ].filter(Boolean);
  const whereArg = filters.length ? `, where: { ${filters.join(', ')} }` : '';
  const expandedFields = fieldMode === 'expanded' ? `
            Owner {
              Name { value }
            }` : '';

  return `query SalesforceAccountIntel {
  uiapi {
    query {
      Account(first: ${limit}${whereArg}) {
        edges {
          node {
            Id
            Name { value }
            Industry { value }
            Type { value }
            Website { value }${expandedFields}
          }
        }
      }
    }
  }
}`;
}

function mockControlledAccountGraphQLResponse(controls) {
  const rows = mockAccountRows
    .filter((row) => controls.industry === 'all' || row.industry === controls.industry)
    .filter((row) => controls.accountType === 'all' || row.type === controls.accountType)
    .slice(0, controls.limit)
    .map((row) => ({
      node: {
        Id: row.id,
        Name: { value: row.name },
        Industry: { value: row.industry },
        Type: { value: row.type },
        Website: { value: row.website },
        ...(controls.fieldMode === 'expanded' ? { Owner: { Name: { value: row.owner } } } : {}),
      },
    }));

  return {
    mode: 'mock',
    data: { uiapi: { query: { Account: { edges: rows } } } },
    extensions: {
      controlledProxy: true,
      fieldMode: controls.fieldMode,
      note: 'Mock response. Enable SALESFORCE_ENABLE_LIVE=true to call Salesforce.',
    },
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


// Controlled profile SOQL proxy. This is safer than letting the browser submit arbitrary SOQL.
app.post('/api/salesforce/profile-query', async (req, res) => {
  let controls;
  try {
    controls = normalizeControlledProfileQuery(req.body || {});
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const query = buildControlledProfileSoqlQuery(controls);

  try {
    if (!liveMode) {
      return res.json(mockControlledProfileQueryResponse(controls));
    }

    const token = await getSalesforceToken();
    const apiVersion = process.env.SALESFORCE_API_VERSION || 'v64.0';
    const url = `${token.instanceUrl}/services/data/${apiVersion}/query/?q=${encodeURIComponent(query)}`;
    const sfResponse = await fetch(url, {
      headers: { Authorization: `Bearer ${token.accessToken}` },
    });
    const payload = await sfResponse.json();

    if (!sfResponse.ok) {
      return res.status(sfResponse.status).json({
        error: 'Controlled Salesforce profile query failed.',
        requestedControls: controls,
        requestedQuery: query,
        salesforce: payload,
      });
    }

    return res.json({
      mode: 'live',
      requestedControls: controls,
      requestedQuery: query,
      totalSize: payload.totalSize,
      done: payload.done,
      records: Array.isArray(payload.records)
        ? payload.records.map((record) => normalizeSalesforceProfileRecord(controls.queryKey, record))
        : [],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

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

// Controlled Account GraphQL proxy. This keeps public interaction allowlisted while still using live Salesforce GraphQL.
app.post('/api/salesforce/graphql/account-query', async (req, res) => {
  let controls;
  try {
    controls = normalizeControlledAccountQuery(req.body || {});
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const query = buildControlledAccountGraphQLQuery(controls);

  try {
    if (!liveMode) {
      return res.json({
        ...mockControlledAccountGraphQLResponse(controls),
        requestedControls: controls,
        requestedQuery: query,
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
      body: JSON.stringify({ query, variables: {} }),
    });
    const payload = await sfResponse.json();
    return res.status(sfResponse.status).json({
      ...payload,
      requestedControls: controls,
      extensions: {
        ...(payload.extensions || {}),
        controlledProxy: true,
        fieldMode: controls.fieldMode,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Live GraphQL proxy example. Endpoint may vary by org/API version; validate in your Salesforce org before enabling.
app.post('/api/salesforce/graphql', async (req, res) => {
  if (!allowRawGraphQL) {
    return res.status(403).json({
      error: 'Raw GraphQL proxy is disabled. Use /api/salesforce/graphql/account-query for allowlisted Account queries.',
    });
  }

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
  console.log(`Raw GraphQL proxy: ${allowRawGraphQL ? 'ON' : 'OFF / CONTROLLED ONLY'}`);
});
