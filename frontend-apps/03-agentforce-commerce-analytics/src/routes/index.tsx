import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXUS BI — Salesforce GraphQL Command Center" },
      {
        name: "description",
        content:
          "Real-time Salesforce GraphQL business intelligence command center with pipeline KPIs, live query telemetry, and interactive record grid.",
      },
      { property: "og:title", content: "NEXUS BI — Salesforce GraphQL Command Center" },
      {
        property: "og:description",
        content:
          "Cyber-enterprise dashboard visualizing Salesforce GraphQL queries, KPIs, and account intelligence in real time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

/* ============================================================
 * GRAPHQL QUERY STATE
 * ------------------------------------------------------------
 * This query is intentionally simple and valid for a default
 * Salesforce Developer Edition org. It uses Salesforce GraphQL
 * UI API through the Railway proxy endpoint:
 *
 *   POST /api/salesforce/graphql/account-query
 *
 * This is a live Salesforce GraphQL API demonstration when
 * VITE_BACKEND_PROXY_URL points to the Railway backend and
 * SALESFORCE_ENABLE_LIVE=true in Railway.
 * ============================================================ */
type NavKey = "pipeline" | "accounts" | "agents" | "forecast" | "ops";

const navTabs: { key: NavKey; label: string; hint: string }[] = [
  { key: "pipeline", label: "Pipeline", hint: "simulated opportunity grid" },
  { key: "accounts", label: "Accounts", hint: "live Salesforce GraphQL" },
  { key: "agents", label: "Agents", hint: "simulated handoffs" },
  { key: "forecast", label: "Forecast", hint: "mock revenue outlook" },
  { key: "ops", label: "Ops", hint: "proxy health concept" },
];

type AccountLimit = 3 | 5 | 10;
type AccountFieldMode = "basic" | "expanded";
type AccountIndustryFilter =
  | "all"
  | "Electronics"
  | "Apparel"
  | "Construction"
  | "Consulting"
  | "Hospitality";
type AccountTypeFilter = "all" | "Customer - Direct" | "Customer - Channel";

type GraphQLAccountControls = {
  limit: AccountLimit;
  industry: AccountIndustryFilter;
  accountType: AccountTypeFilter;
  fieldMode: AccountFieldMode;
};

const accountLimitOptions: AccountLimit[] = [3, 5, 10];

const accountIndustryOptions: { value: AccountIndustryFilter; label: string }[] = [
  { value: "all", label: "All industries" },
  { value: "Electronics", label: "Electronics" },
  { value: "Apparel", label: "Apparel" },
  { value: "Construction", label: "Construction" },
  { value: "Consulting", label: "Consulting" },
  { value: "Hospitality", label: "Hospitality" },
];

const accountTypeOptions: { value: AccountTypeFilter; label: string }[] = [
  { value: "all", label: "All account types" },
  { value: "Customer - Direct", label: "Customer - Direct" },
  { value: "Customer - Channel", label: "Customer - Channel" },
];

const accountFieldModeOptions: { value: AccountFieldMode; label: string; hint: string }[] = [
  { value: "basic", label: "Basic fields", hint: "Name, Industry, Type, Website" },
  { value: "expanded", label: "Expanded fields", hint: "Adds Owner.Name relationship" },
];

const defaultGraphQLControls: GraphQLAccountControls = {
  limit: 5,
  industry: "all",
  accountType: "all",
  fieldMode: "basic",
};

function quoteGraphQLValue(value: string) {
  return JSON.stringify(value);
}

function buildAccountGraphQLQuery(controls: GraphQLAccountControls) {
  const filters = [
    controls.industry !== "all" ? `Industry: { eq: ${quoteGraphQLValue(controls.industry)} }` : null,
    controls.accountType !== "all" ? `Type: { eq: ${quoteGraphQLValue(controls.accountType)} }` : null,
  ].filter(Boolean);

  const whereArg = filters.length ? `, where: { ${filters.join(", ")} }` : "";
  const expandedFields =
    controls.fieldMode === "expanded"
      ? `
            Owner {
              Name { value }
            }`
      : "";

  return `query SalesforceAccountIntel {
  uiapi {
    query {
      Account(first: ${controls.limit}${whereArg}) {
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

// Simulated response payload — replace with SF GraphQL endpoint result
const mockGraphQLResponse = {
  data: {
    uiapi: {
      query: {
        Opportunity: {
          edges: [
            {
              node: {
                Id: "0065f00000A1x1Q",
                Name: { value: "Helios Cloud Migration — Phase 3" },
                Amount: { value: 1_240_000 },
                StageName: { value: "Negotiation" },
                Probability: { value: 0.82 },
                CloseDate: { value: "2026-08-14" },
                Account: {
                  Id: "0015f00000B2xR",
                  Name: { value: "Helios Aerospace" },
                  Industry: { value: "Aerospace" },
                  AnnualRevenue: { value: 4_200_000_000 },
                  Parent: { Id: "0015f00000ZZR9", Name: { value: "Helios Holdings" } },
                },
                Owner: { Name: { value: "M. Okafor" } },
              },
            },
          ],
        },
      },
    },
  },
  extensions: { latencyMs: 42, queryPlan: "cached", cost: 128 },
};

/* Records shown in the grid — normally derived from mockGraphQLResponse */
type OppRecord = {
  id: string;
  name: string;
  parent: string;
  amount: number;
  stage: string;
  probability: number;
  owner: string;
  category: "high-value" | "at-risk" | "closing-soon" | "ai-assisted";
  industry: string;
};

function getOpportunityDetail(record: OppRecord) {
  const urgency =
    record.probability >= 85
      ? "High confidence close path"
      : record.probability >= 60
      ? "Active executive follow-up"
      : "Needs risk review";

  const nextAction =
    record.stage === "Closed Won"
      ? "Route to post-sale onboarding and expansion planning."
      : record.stage === "Stalled" || record.probability < 30
      ? "Schedule recovery touchpoint and confirm blocker ownership."
      : record.stage === "Commit"
      ? "Confirm procurement path and final approval timeline."
      : "Review account signals, decision timeline, and next-best action.";

  const graphQLShape = record.owner.startsWith("AI")
    ? "Opportunity + Account + Owner + AI handoff metadata"
    : "Opportunity + Account + Owner relationship fields";

  return { urgency, nextAction, graphQLShape };
}

const records: OppRecord[] = [
  { id: "OPP-8821", name: "Helios Cloud Migration", parent: "Helios Holdings", amount: 1_240_000, stage: "Negotiation", probability: 82, owner: "M. Okafor", category: "high-value", industry: "Aerospace" },
  { id: "OPP-8790", name: "Northwind Data Platform", parent: "Northwind Group", amount: 890_000, stage: "Proposal", probability: 65, owner: "S. Kaur", category: "high-value", industry: "Logistics" },
  { id: "OPP-8712", name: "Verity Renewal Q3", parent: "Verity Corp", amount: 220_000, stage: "Stalled", probability: 22, owner: "J. Chen", category: "at-risk", industry: "Fintech" },
  { id: "OPP-8688", name: "Orion Analytics Expansion", parent: "Orion Systems", amount: 540_000, stage: "Closed Won", probability: 100, owner: "AI Agent Δ-7", category: "ai-assisted", industry: "SaaS" },
  { id: "OPP-8654", name: "Kestrel Security Upsell", parent: "Kestrel Labs", amount: 410_000, stage: "Commit", probability: 91, owner: "R. Alvarez", category: "closing-soon", industry: "Cybersec" },
  { id: "OPP-8621", name: "Meridian Insurance Bundle", parent: "Meridian Global", amount: 1_020_000, stage: "Negotiation", probability: 74, owner: "AI Agent Δ-2", category: "high-value", industry: "Insurance" },
  { id: "OPP-8598", name: "Zephyr Manufacturing Line", parent: "Zephyr Industrial", amount: 165_000, stage: "Discovery", probability: 18, owner: "T. Nakamura", category: "at-risk", industry: "Manufacturing" },
  { id: "OPP-8571", name: "Lumen Retail Rollout", parent: "Lumen Retail Co.", amount: 720_000, stage: "Commit", probability: 88, owner: "AI Agent Δ-1", category: "closing-soon", industry: "Retail" },
  { id: "OPP-8540", name: "Atlas Bank Modernization", parent: "Atlas Holdings", amount: 2_180_000, stage: "Negotiation", probability: 79, owner: "L. Petrov", category: "high-value", industry: "Banking" },
  { id: "OPP-8503", name: "Cipher Media Renewal", parent: "Cipher Media", amount: 95_000, stage: "Stalled", probability: 14, owner: "K. Diallo", category: "at-risk", industry: "Media" },
  { id: "OPP-8477", name: "Ridgeline Health AI Pilot", parent: "Ridgeline Health", amount: 385_000, stage: "Commit", probability: 92, owner: "AI Agent Δ-4", category: "ai-assisted", industry: "Healthcare" },
  { id: "OPP-8442", name: "Cobalt Utilities Grid", parent: "Cobalt Energy", amount: 610_000, stage: "Proposal", probability: 71, owner: "AI Agent Δ-9", category: "ai-assisted", industry: "Energy" },
];

type FilterKey = "all" | "high-value" | "at-risk" | "closing-soon" | "ai-assisted";

const filters: { key: FilterKey; label: string; hint: string }[] = [
  { key: "all", label: "All Records", hint: "full pipeline" },
  { key: "high-value", label: "High Value Leads", hint: "≥ $500k ARR" },
  { key: "at-risk", label: "At-Risk Accounts", hint: "prob < 30%" },
  { key: "closing-soon", label: "Closing Soon", hint: "commit stage" },
  { key: "ai-assisted", label: "Agent Assisted", hint: "AI-closed" },
];

// ============================================================================
// LIVE SALESFORCE GRAPHQL PROXY TYPES
// ============================================================================
type LiveGraphQLAccount = {
  id: string;
  name: string;
  industry: string;
  type: string;
  website: string;
  owner: string;
};

type LiveGraphQLState = {
  loading: boolean;
  error: string | null;
  records: LiveGraphQLAccount[];
  raw: unknown | null;
  lastUpdated: string | null;
};

type DetailOverlay =
  | { kind: "opportunity"; record: OppRecord }
  | { kind: "account"; record: LiveGraphQLAccount }
  | null;

type SortDirection = "asc" | "desc";
type SortState<Key extends string> = { key: Key; direction: SortDirection };
type OpportunitySortKey = "id" | "name" | "parent" | "industry" | "amount" | "stage" | "probability" | "owner";
type AccountSortKey = "id" | "name" | "industry" | "type" | "website" | "owner";
type DetailSortKey = "label" | "value" | "source";

type DetailRow = {
  label: string;
  value: string;
  source: string;
};

const defaultOpportunitySort: SortState<OpportunitySortKey> = { key: "amount", direction: "desc" };
const defaultAccountSort: SortState<AccountSortKey> = { key: "name", direction: "asc" };
const defaultDetailSort: SortState<DetailSortKey> = { key: "label", direction: "asc" };

function nextSortState<Key extends string>(current: SortState<Key>, key: Key): SortState<Key> {
  if (current.key === key) {
    return { key, direction: current.direction === "asc" ? "desc" : "asc" };
  }
  return { key, direction: "asc" };
}

function compareSortValues(a: string | number, b: string | number, direction: SortDirection) {
  const multiplier = direction === "asc" ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") {
    return (a - b) * multiplier;
  }
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" }) * multiplier;
}

function sortOpportunities(items: OppRecord[], sort: SortState<OpportunitySortKey>) {
  return [...items].sort((a, b) => compareSortValues(a[sort.key], b[sort.key], sort.direction));
}

function sortAccounts(items: LiveGraphQLAccount[], sort: SortState<AccountSortKey>) {
  return [...items].sort((a, b) => compareSortValues(a[sort.key], b[sort.key], sort.direction));
}

function sortDetailRows(items: DetailRow[], sort: SortState<DetailSortKey>) {
  return [...items].sort((a, b) => compareSortValues(a[sort.key], b[sort.key], sort.direction));
}

const BACKEND_PROXY_URL = import.meta.env.VITE_BACKEND_PROXY_URL as
  | string
  | undefined;

function valueOf(field: unknown): string {
  if (field && typeof field === "object" && "value" in field) {
    const value = (field as { value?: unknown }).value;
    return value == null ? "—" : String(value);
  }
  return "—";
}

function extractGraphQLAccounts(payload: unknown): LiveGraphQLAccount[] {
  const root = payload as {
    data?: { uiapi?: { query?: { Account?: { edges?: Array<{ node?: Record<string, unknown> }> } } } };
  };
  const edges = root.data?.uiapi?.query?.Account?.edges;
  if (!Array.isArray(edges)) return [];

  return edges.map((edge) => {
    const node = edge.node || {};
    return {
      id: typeof node.Id === "string" ? node.Id : "—",
      name: valueOf(node.Name),
      industry: valueOf(node.Industry),
      type: valueOf(node.Type),
      website: valueOf(node.Website),
      owner:
        node.Owner && typeof node.Owner === "object"
          ? valueOf((node.Owner as Record<string, unknown>).Name)
          : "—",
    };
  });
}

async function fetchLiveGraphQLAccounts(
  controls: GraphQLAccountControls,
): Promise<{ records: LiveGraphQLAccount[]; raw: unknown }> {
  if (!BACKEND_PROXY_URL) {
    throw new Error(
      "Missing VITE_BACKEND_PROXY_URL. Add the Railway backend URL in this Vercel project's Environment Variables.",
    );
  }

  const response = await fetch(`${BACKEND_PROXY_URL}/api/salesforce/graphql/account-query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(controls),
  });

  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    throw new Error(
      payload.errors
        .map((item: { message?: string }) => item.message || JSON.stringify(item))
        .join(" | "),
    );
  }

  return { records: extractGraphQLAccounts(payload), raw: payload };
}

function Dashboard() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [activeOverlay, setActiveOverlay] = useState<DetailOverlay>(null);
  const [opportunitySort, setOpportunitySort] = useState<SortState<OpportunitySortKey>>(defaultOpportunitySort);
  const [accountSort, setAccountSort] = useState<SortState<AccountSortKey>>(defaultAccountSort);
  const [overlaySort, setOverlaySort] = useState<SortState<DetailSortKey>>(defaultDetailSort);
  const [activeNavTab, setActiveNavTab] = useState<NavKey>("pipeline");
  const [graphQLControls, setGraphQLControls] = useState<GraphQLAccountControls>(defaultGraphQLControls);
  const [latency, setLatency] = useState(42);
  const [handoffs, setHandoffs] = useState(7);
  const [revenue, setRevenue] = useState(8_420_000);
  const [liveGraphQL, setLiveGraphQL] = useState<LiveGraphQLState>({
    loading: false,
    error: null,
    records: [],
    raw: null,
    lastUpdated: null,
  });

  // Simulated live telemetry ticks
  useEffect(() => {
    const id = setInterval(() => {
      setLatency(30 + Math.floor(Math.random() * 40));
      setHandoffs((h) => Math.max(3, Math.min(14, h + (Math.random() > 0.5 ? 1 : -1))));
      setRevenue((r) => r + Math.floor((Math.random() - 0.3) * 40_000));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const visible = useMemo(() => {
    const filtered = filter === "all" ? records : records.filter((r) => r.category === filter);
    return sortOpportunities(filtered, opportunitySort);
  }, [filter, opportunitySort]);

  const sortedLiveAccounts = useMemo(
    () => sortAccounts(liveGraphQL.records, accountSort),
    [liveGraphQL.records, accountSort],
  );

  const activeGraphQLQuery = useMemo(
    () => buildAccountGraphQLQuery(graphQLControls),
    [graphQLControls],
  );

  const jsonString = useMemo(
    () => JSON.stringify(liveGraphQL.raw || mockGraphQLResponse, null, 2),
    [liveGraphQL.raw],
  );

  const loadLiveGraphQLAccounts = async () => {
    setLiveGraphQL((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await fetchLiveGraphQLAccounts(graphQLControls);
      setLiveGraphQL({
        loading: false,
        error: null,
        records: result.records,
        raw: result.raw,
        lastUpdated: new Date().toLocaleString(),
      });
    } catch (error) {
      setLiveGraphQL((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown GraphQL request error",
      }));
    }
  };

  const handleNavSelect = (tab: NavKey) => {
    setActiveNavTab(tab);
    if (tab === "accounts" && !liveGraphQL.loading && liveGraphQL.records.length === 0) {
      void loadLiveGraphQLAccounts();
    }
  };

  const handleGraphQLControlsChange = (nextControls: GraphQLAccountControls) => {
    setGraphQLControls(nextControls);
    setLiveGraphQL({
      loading: false,
      error: null,
      records: [],
      raw: null,
      lastUpdated: null,
    });
  };

  const pageEyebrow =
    activeNavTab === "accounts"
      ? "Sector 7 · Live Account GraphQL"
      : activeNavTab === "pipeline"
      ? "Sector 7 · Revenue Intelligence"
      : "Sector 7 · Console Preview";

  const pageTitle =
    activeNavTab === "accounts"
      ? "Live Salesforce Account Query"
      : activeNavTab === "pipeline"
      ? "Real-time Salesforce Intelligence"
      : `${navTabs.find((tab) => tab.key === activeNavTab)?.label} View Preview`;

  return (
    <div className="min-h-screen grid-bg">
      {/* HEADER */}
      <header className="border-b border-border/60 backdrop-blur-md sticky top-0 z-20 bg-background/70">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[var(--neon-pink)] to-[var(--electric-blue)] glow-pink" />
              <span className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-[var(--cyber-green)] animate-pulse-dot" />
            </div>
            <div className="leading-tight">
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--electric-blue)] font-mono">
                Nexus // BI
              </div>
              <div className="text-sm font-semibold">Salesforce GraphQL Command Center</div>
            </div>
          </div>

          <nav className="hidden md:flex gap-1 ml-4 text-xs font-mono uppercase tracking-wider">
            {navTabs.map((tab) => {
              const active = tab.key === activeNavTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  title={tab.hint}
                  onClick={() => handleNavSelect(tab.key)}
                  className={`px-3 py-1.5 rounded-md transition ${
                    active
                      ? "bg-[var(--surface-2)] text-[var(--neon-pink)] glow-pink"
                      : "text-muted-foreground hover:text-foreground hover:bg-[var(--surface-2)]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--cyber-green)] animate-pulse-dot" />
              <span className="text-muted-foreground">SF ORG</span>
              <span className="text-foreground">nexus-prod-01</span>
            </div>
            <div className="text-muted-foreground animate-ticker">
              LIVE · {new Date().toISOString().slice(11, 19)}Z
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* PAGE HEADING */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.3em] text-[var(--electric-blue)]">
              {pageEyebrow}
            </div>
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold text-gradient-cyber">
              {pageTitle}
            </h1>
          </div>
          <div className="flex gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-md panel">SCHEMA v62.0</span>
            <span className="px-3 py-1.5 rounded-md panel">ENV · production</span>
            <span className="px-3 py-1.5 rounded-md panel glow-blue text-[var(--electric-blue)]">
              ONLINE
            </span>
          </div>
        </div>

        {/* TOP: GraphQL IDE + JSON RESPONSE */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QueryIDE query={activeGraphQLQuery} />
          <ResponseViewer json={jsonString} latency={latency} isLive={Boolean(liveGraphQL.raw)} />
        </section>

        {/* LIVE GRAPHQL PROXY TEST */}
        <LiveGraphQLProxyPanel
          state={{ ...liveGraphQL, records: sortedLiveAccounts }}
          controls={graphQLControls}
          accountSort={accountSort}
          onAccountSort={(key) => setAccountSort((current) => nextSortState(current, key))}
          onOpenAccount={(record) => setActiveOverlay({ kind: "account", record })}
          onControlsChange={handleGraphQLControlsChange}
          onRun={loadLiveGraphQLAccounts}
        />

        {/* MIDDLE: KPI CARDS */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="AI-Closed Won Revenue"
            value={`$${(revenue / 1_000_000).toFixed(2)}M`}
            delta="+12.4%"
            accent="pink"
            spark={[3, 5, 4, 7, 6, 8, 9, 12, 11, 14]}
          />
          <KpiCard
            label="GraphQL Query Speed"
            value={`${latency}ms`}
            delta={latency < 50 ? "optimal" : "elevated"}
            accent={latency < 50 ? "blue" : "amber"}
            spark={[9, 7, 8, 6, 5, 6, 4, 5, 4, 3]}
          />
          <KpiCard
            label="Agent Hand-offs Active"
            value={String(handoffs)}
            delta="live"
            accent="green"
            spark={[2, 3, 5, 4, 6, 5, 7, 6, 8, handoffs]}
          />
          <KpiCard
            label="At-Risk Pipeline"
            value="$1.83M"
            delta="-3.1%"
            accent="amber"
            spark={[8, 9, 7, 8, 6, 7, 5, 6, 5, 4]}
          />
        </section>

        {/* BOTTOM: FILTERS + GRID */}
        <section className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.3em] text-[var(--electric-blue)]">
                Target records · {visible.length}
              </div>
              <h2 className="text-xl font-semibold mt-1">Account Intelligence Grid</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`group relative px-3.5 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all duration-300 border ${
                      active
                        ? "border-[var(--neon-pink)] text-[var(--neon-pink)] glow-pink"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-[var(--electric-blue)]"
                    }`}
                  >
                    <span className="block">{f.label}</span>
                    <span className="block text-[10px] opacity-70 normal-case tracking-normal">
                      {f.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                  <SortableTh label="ID" sortKey="id" sort={opportunitySort} onSort={(key) => setOpportunitySort((current) => nextSortState(current, key))} />
                  <SortableTh label="Opportunity" sortKey="name" sort={opportunitySort} onSort={(key) => setOpportunitySort((current) => nextSortState(current, key))} />
                  <SortableTh label="Parent Account" sortKey="parent" sort={opportunitySort} onSort={(key) => setOpportunitySort((current) => nextSortState(current, key))} />
                  <SortableTh label="Industry" sortKey="industry" sort={opportunitySort} onSort={(key) => setOpportunitySort((current) => nextSortState(current, key))} />
                  <SortableTh label="Amount" sortKey="amount" sort={opportunitySort} onSort={(key) => setOpportunitySort((current) => nextSortState(current, key))} align="right" />
                  <SortableTh label="Stage" sortKey="stage" sort={opportunitySort} onSort={(key) => setOpportunitySort((current) => nextSortState(current, key))} />
                  <SortableTh label="Prob." sortKey="probability" sort={opportunitySort} onSort={(key) => setOpportunitySort((current) => nextSortState(current, key))} />
                  <SortableTh label="Owner" sortKey="owner" sort={opportunitySort} onSort={(key) => setOpportunitySort((current) => nextSortState(current, key))} />
                </tr>
              </thead>
              <tbody>
                {visible.map((r, i) => (
                  <tr
                    key={r.id}
                    style={{ animationDelay: `${i * 40}ms` }}
                    className="animate-flip-in border-b border-border/40 hover:bg-[var(--surface-2)]/60 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveOverlay({ kind: "opportunity", record: r })}
                        className="text-[var(--electric-blue)] underline decoration-[var(--electric-blue)]/40 underline-offset-4 transition hover:text-[var(--cyber-green)] hover:decoration-[var(--cyber-green)] focus:outline-none focus:ring-2 focus:ring-[var(--electric-blue)] focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                        aria-label={`Open full-screen detail overlay for ${r.id} ${r.name}`}
                      >
                        {r.id}
                      </button>
                    </td>
                    <td className="py-3 px-3 font-medium">{r.name}</td>
                    <td className="py-3 px-3 text-muted-foreground">{r.parent}</td>
                    <td className="py-3 px-3 text-muted-foreground">{r.industry}</td>
                    <td className="py-3 px-3 text-right font-mono">
                      ${(r.amount / 1000).toLocaleString()}k
                    </td>
                    <td className="py-3 px-3">
                      <StagePill stage={r.stage} />
                    </td>
                    <td className="py-3 px-3">
                      <ProbabilityBar value={r.probability} />
                    </td>
                    <td className="py-3 px-3 font-mono text-xs">
                      {r.owner.startsWith("AI") ? (
                        <span className="text-[var(--neon-pink)]">{r.owner}</span>
                      ) : (
                        r.owner
                      )}
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted-foreground">
                      No records match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <RecordDetailOverlay
          overlay={activeOverlay}
          sort={overlaySort}
          onSort={(key) => setOverlaySort((current) => nextSortState(current, key))}
          onClose={() => setActiveOverlay(null)}
        />

        <footer className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground py-4 text-center">
          Nexus BI · GraphQL UI fixed · sortable tables · live proxy test uses{" "}
          <span className="text-[var(--electric-blue)]">/api/salesforce/graphql/account-query</span>
        </footer>
      </main>
    </div>
  );
}

/* ---------- Components ---------- */

function RecordDetailOverlay({
  overlay,
  sort,
  onSort,
  onClose,
}: {
  overlay: DetailOverlay;
  sort: SortState<DetailSortKey>;
  onSort: (key: DetailSortKey) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!overlay) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [overlay, onClose]);

  if (!overlay) return null;

  const isOpportunity = overlay.kind === "opportunity";
  const title = isOpportunity ? overlay.record.name : overlay.record.name;
  const subtitle = isOpportunity ? overlay.record.id : overlay.record.id;
  const eyebrow = isOpportunity ? "Opportunity Drilldown" : "Live Salesforce Account Drilldown";
  const sourceNote = isOpportunity
    ? "This centered overlay is powered by the simulated portfolio pipeline grid. A later version could map these rows to live Opportunity records."
    : "This centered overlay uses the live Salesforce GraphQL Account response returned through the Railway proxy.";

  const rows = isOpportunity
    ? buildOpportunityDetailRows(overlay.record)
    : buildAccountDetailRows(overlay.record);
  const sortedRows = sortDetailRows(rows, sort);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${eyebrow} for ${subtitle}`}
    >
      <button
        type="button"
        aria-label="Close record detail overlay"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="relative z-10 w-full max-w-6xl overflow-hidden rounded-2xl border border-[var(--electric-blue)]/30 bg-background/95 shadow-2xl glow-blue">
        <div className="flex flex-col gap-4 border-b border-border bg-[var(--surface-2)]/60 px-5 py-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.3em] text-[var(--cyber-green)]">
              {eyebrow}
            </div>
            <h3 className="mt-2 text-2xl font-semibold text-gradient-cyber md:text-3xl">{title}</h3>
            <p className="mt-1 font-mono text-xs text-[var(--electric-blue)]">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="self-start rounded-md border border-border px-3 py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground transition hover:border-[var(--electric-blue)] hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto p-5 space-y-5">
          {isOpportunity ? (
            <OpportunityOverlaySummary record={overlay.record} />
          ) : (
            <AccountOverlaySummary record={overlay.record} />
          )}

          <div className="panel p-4">
            <div className="flex flex-col gap-2 border-b border-border pb-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                  Sortable Detail Matrix
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Click the column headings to sort the overlay fields without leaving the command center.
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--electric-blue)]">
                Center overlay · responsive
              </span>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                    <SortableTh label="Field" sortKey="label" sort={sort} onSort={onSort} />
                    <SortableTh label="Value" sortKey="value" sort={sort} onSort={onSort} />
                    <SortableTh label="Source" sortKey="source" sort={sort} onSort={onSort} />
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((row) => (
                    <tr key={`${row.label}-${row.source}`} className="border-b border-border/40 hover:bg-[var(--surface-2)]/60">
                      <td className="py-3 px-3 font-mono text-xs text-[var(--electric-blue)]">{row.label}</td>
                      <td className="py-3 px-3 font-medium">{row.value}</td>
                      <td className="py-3 px-3 text-muted-foreground">{row.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              Demonstration Boundary
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{sourceNote}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function OpportunityOverlaySummary({ record }: { record: OppRecord }) {
  const detail = getOpportunityDetail(record);
  const amount = `$${(record.amount / 1_000_000).toFixed(2)}M`;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 panel p-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          Action Intelligence
        </div>
        <p className="mt-3 text-lg font-semibold text-foreground">{detail.urgency}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail.nextAction}</p>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          GraphQL concept: <span className="text-[var(--electric-blue)]">{detail.graphQLShape}</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <DetailMetric label="Amount" value={amount} />
        <DetailMetric label="Probability" value={`${record.probability}%`} />
        <DetailMetric label="Stage" value={record.stage} />
        <DetailMetric label="Owner" value={record.owner} />
      </div>
    </div>
  );
}

function AccountOverlaySummary({ record }: { record: LiveGraphQLAccount }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 panel p-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          Live Account Context
        </div>
        <p className="mt-3 text-lg font-semibold text-foreground">{record.name}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This account was returned from Salesforce GraphQL UI API through the Railway backend proxy. The browser sees the response data, but not the Salesforce OAuth token or Connected App secret.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <DetailMetric label="Industry" value={record.industry} />
        <DetailMetric label="Type" value={record.type} />
        <DetailMetric label="Owner" value={record.owner} />
        <DetailMetric label="Source" value="Live GraphQL" />
      </div>
    </div>
  );
}

function buildOpportunityDetailRows(record: OppRecord): DetailRow[] {
  const detail = getOpportunityDetail(record);
  return [
    { label: "Opportunity ID", value: record.id, source: "Simulated grid" },
    { label: "Opportunity", value: record.name, source: "Simulated grid" },
    { label: "Parent Account", value: record.parent, source: "Simulated relationship" },
    { label: "Industry", value: record.industry, source: "Simulated account field" },
    { label: "Amount", value: `$${record.amount.toLocaleString()}`, source: "Simulated opportunity field" },
    { label: "Stage", value: record.stage, source: "Simulated opportunity field" },
    { label: "Probability", value: `${record.probability}%`, source: "Simulated opportunity field" },
    { label: "Owner", value: record.owner, source: "Simulated owner field" },
    { label: "Category", value: record.category.replace("-", " "), source: "UI filter segment" },
    { label: "Next Action", value: detail.nextAction, source: "Derived demo logic" },
  ];
}

function buildAccountDetailRows(record: LiveGraphQLAccount): DetailRow[] {
  return [
    { label: "Salesforce ID", value: record.id, source: "Live GraphQL response" },
    { label: "Account Name", value: record.name, source: "Live GraphQL response" },
    { label: "Industry", value: record.industry, source: "Live GraphQL response" },
    { label: "Type", value: record.type, source: "Live GraphQL response" },
    { label: "Website", value: record.website, source: "Live GraphQL response" },
    { label: "Owner", value: record.owner, source: "Expanded GraphQL field" },
    { label: "Credential Boundary", value: "Railway only", source: "Architecture" },
  ];
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-[var(--surface-2)]/50 p-3">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}

function SortableTh<Key extends string>({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: Key;
  sort: SortState<Key>;
  onSort: (key: Key) => void;
  align?: "left" | "right";
}) {
  const active = sort.key === sortKey;
  const arrow = active ? (sort.direction === "asc" ? "↑" : "↓") : "↕";
  return (
    <th className={`py-3 px-3 ${align === "right" ? "text-right" : "text-left"}`} aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1.5 rounded-sm transition hover:text-[var(--electric-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--electric-blue)] focus:ring-offset-2 focus:ring-offset-background ${align === "right" ? "justify-end" : "justify-start"}`}
        title={`Sort by ${label}`}
      >
        <span>{label}</span>
        <span className={active ? "text-[var(--cyber-green)]" : "text-muted-foreground/60"}>{arrow}</span>
      </button>
    </th>
  );
}

function QueryIDE({ query }: { query: string }) {
  const lines = query.split("\n");
  return (
    <div className="panel overflow-hidden relative">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-[var(--surface-2)]/50">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--neon-pink)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--warning-amber)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--cyber-green)]" />
          <span className="ml-3 text-xs font-mono text-muted-foreground">
            salesforce.graphql.uiapi
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
          <span className="text-[var(--electric-blue)]">▶ Execute</span>
          <span className="text-muted-foreground">Railway proxy</span>
        </div>
      </div>
      <div className="relative">
        <pre className="text-sm md:text-[15px] leading-7 font-mono p-5 overflow-x-auto max-h-[420px]">
          <code>
            {lines.map((line, lineIndex) => (
              <span key={lineIndex} className="block">
                <span className="select-none inline-block w-8 pr-3 text-right text-muted-foreground/50">
                  {lineIndex + 1}
                </span>
                {tokenizeGraphQLLine(line).map((token, tokenIndex) => (
                  <span key={`${lineIndex}-${tokenIndex}`} className={graphQLTokenClass(token.type)}>
                    {token.text}
                  </span>
                ))}
              </span>
            ))}
          </code>
        </pre>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[var(--neon-pink)]/10 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--electric-blue)] to-transparent animate-scan opacity-60" />
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t border-border text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <span>Controlled Account query · server-side allowlist</span>
        <span>
          Endpoint <span className="text-[var(--electric-blue)]">/api/salesforce/graphql/account-query</span>
        </span>
      </div>
    </div>
  );
}

function LiveGraphQLProxyPanel({
  state,
  controls,
  accountSort,
  onAccountSort,
  onOpenAccount,
  onControlsChange,
  onRun,
}: {
  state: LiveGraphQLState;
  controls: GraphQLAccountControls;
  accountSort: SortState<AccountSortKey>;
  onAccountSort: (key: AccountSortKey) => void;
  onOpenAccount: (record: LiveGraphQLAccount) => void;
  onControlsChange: (controls: GraphQLAccountControls) => void;
  onRun: () => void;
}) {
  const updateControls = (patch: Partial<GraphQLAccountControls>) => {
    onControlsChange({ ...controls, ...patch });
  };

  return (
    <section className="panel p-5">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
        <div className="max-w-4xl">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-[var(--cyber-green)]">
            Live Salesforce GraphQL Proxy Test
          </div>
          <h2 className="mt-2 text-2xl font-semibold">Railway → Salesforce GraphQL API</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This panel turns the Accounts tab into a controlled live GraphQL demo. The browser can change
            record count, filter criteria, and field shape, but Railway rebuilds the allowlisted Account query
            before sending it to Salesforce. This demonstrates GraphQL field selection without exposing
            Salesforce credentials or a raw public query console.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <label className="block rounded-md border border-border bg-[var(--surface-2)]/40 p-3">
              <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Record count
              </span>
              <select
                value={controls.limit}
                disabled={state.loading}
                onChange={(event) => updateControls({ limit: Number(event.target.value) as AccountLimit })}
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {accountLimitOptions.map((limit) => (
                  <option key={limit} value={limit}>
                    {limit} Accounts
                  </option>
                ))}
              </select>
            </label>

            <label className="block rounded-md border border-border bg-[var(--surface-2)]/40 p-3">
              <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Industry filter
              </span>
              <select
                value={controls.industry}
                disabled={state.loading}
                onChange={(event) => updateControls({ industry: event.target.value as AccountIndustryFilter })}
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {accountIndustryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block rounded-md border border-border bg-[var(--surface-2)]/40 p-3">
              <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Type filter
              </span>
              <select
                value={controls.accountType}
                disabled={state.loading}
                onChange={(event) => updateControls({ accountType: event.target.value as AccountTypeFilter })}
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {accountTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-md border border-border bg-[var(--surface-2)]/40 p-3">
              <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Field shape
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {accountFieldModeOptions.map((option) => {
                  const active = option.value === controls.fieldMode;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={state.loading}
                      onClick={() => updateControls({ fieldMode: option.value })}
                      title={option.hint}
                      className={`rounded-md border px-2 py-2 text-xs font-mono uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        active
                          ? "border-[var(--cyber-green)] text-[var(--cyber-green)] glow-blue"
                          : "border-border text-muted-foreground hover:border-[var(--electric-blue)] hover:text-foreground"
                      }`}
                    >
                      {option.value}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Security note: the visible query updates as you change controls, but the backend still validates the
            same allowlisted limit, filter, and field-shape options before calling Salesforce.
          </p>
        </div>
        <button
          type="button"
          onClick={onRun}
          disabled={state.loading}
          className="rounded-md border border-[var(--electric-blue)] px-4 py-3 text-sm font-mono uppercase tracking-wider text-[var(--electric-blue)] glow-blue transition hover:bg-[var(--electric-blue)]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.loading ? "Running controlled query…" : "Run Controlled GraphQL Query"}
        </button>
      </div>

      {state.error && (
        <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          <strong>GraphQL request error:</strong> {state.error}
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
              <SortableTh label="Salesforce ID" sortKey="id" sort={accountSort} onSort={onAccountSort} />
              <SortableTh label="Account Name" sortKey="name" sort={accountSort} onSort={onAccountSort} />
              <SortableTh label="Industry" sortKey="industry" sort={accountSort} onSort={onAccountSort} />
              <SortableTh label="Type" sortKey="type" sort={accountSort} onSort={onAccountSort} />
              <SortableTh label="Website" sortKey="website" sort={accountSort} onSort={onAccountSort} />
              {controls.fieldMode === "expanded" && <SortableTh label="Owner" sortKey="owner" sort={accountSort} onSort={onAccountSort} />}
            </tr>
          </thead>
          <tbody>
            {state.records.length > 0 ? (
              state.records.map((record) => (
                <tr key={record.id} className="border-b border-border/40 hover:bg-[var(--surface-2)]/60">
                  <td className="py-3 px-3 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => onOpenAccount(record)}
                      className="text-[var(--electric-blue)] underline decoration-[var(--electric-blue)]/40 underline-offset-4 transition hover:text-[var(--cyber-green)] hover:decoration-[var(--cyber-green)] focus:outline-none focus:ring-2 focus:ring-[var(--electric-blue)] focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                      aria-label={`Open full-screen Salesforce account overlay for ${record.id} ${record.name}`}
                    >
                      {record.id}
                    </button>
                  </td>
                  <td className="py-3 px-3 font-medium">{record.name}</td>
                  <td className="py-3 px-3 text-muted-foreground">{record.industry}</td>
                  <td className="py-3 px-3 text-muted-foreground">{record.type}</td>
                  <td className="py-3 px-3 text-muted-foreground">{record.website}</td>
                  {controls.fieldMode === "expanded" && (
                    <td className="py-3 px-3 text-muted-foreground">{record.owner}</td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={controls.fieldMode === "expanded" ? 6 : 5} className="py-6 text-center text-muted-foreground">
                  {state.loading
                    ? "Waiting for Salesforce GraphQL response…"
                    : "Click Run Controlled GraphQL Query to fetch Account records from Salesforce."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
        <span>Mode: {state.raw ? "live response" : "not run"}</span>
        <span>Last updated: {state.lastUpdated || "—"}</span>
        <span>Fields: {controls.fieldMode}</span>
        <span>Credentials: Railway only</span>
      </div>
    </section>
  );
}

function ResponseViewer({
  json,
  latency,
  isLive,
}: {
  json: string;
  latency: number;
  isLive: boolean;
}) {
  return (
    <div className="panel overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-[var(--surface-2)]/50">
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-[var(--cyber-green)]/15 text-[var(--cyber-green)] border border-[var(--cyber-green)]/30">
            200 OK
          </span>
          <span className="text-muted-foreground">response.json</span>
          <span className="animate-pulse-dot h-2 w-2 rounded-full bg-[var(--neon-pink)]" />
        </div>
        <div className="text-[10px] font-mono uppercase tracking-wider">
          <span className="text-muted-foreground">latency </span>
          <span className={latency < 50 ? "text-[var(--cyber-green)]" : "text-[var(--warning-amber)]"}>
            {latency}ms
          </span>
        </div>
      </div>
      <pre className="text-xs md:text-[12.5px] leading-relaxed font-mono p-5 overflow-auto max-h-[420px]">
        <code dangerouslySetInnerHTML={{ __html: highlightJSON(json) }} />
      </pre>
      <div className="flex items-center justify-between px-4 py-2 border-t border-border text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <span>
          response body · {isLive ? "live Salesforce GraphQL response" : "mock until live test runs"}
        </span>
        <span>
          PROXY <span className="text-[var(--electric-blue)]">READY</span>
        </span>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  accent,
  spark,
}: {
  label: string;
  value: string;
  delta: string;
  accent: "pink" | "blue" | "amber" | "green";
  spark: number[];
}) {
  const colorVar =
    accent === "pink"
      ? "var(--neon-pink)"
      : accent === "blue"
      ? "var(--electric-blue)"
      : accent === "amber"
      ? "var(--warning-amber)"
      : "var(--cyber-green)";
  const glow =
    accent === "pink" ? "glow-pink" : accent === "blue" ? "glow-blue" : accent === "amber" ? "glow-amber" : "";
  const max = Math.max(...spark);
  return (
    <div className={`panel p-5 relative overflow-hidden ${glow}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-3 text-3xl font-semibold" style={{ color: colorVar }}>
            {value}
          </div>
          <div className="mt-1 text-xs font-mono text-muted-foreground">Δ {delta}</div>
        </div>
        <div className="flex items-end gap-0.5 h-14">
          {spark.map((v, i) => (
            <span
              key={i}
              className="w-1 rounded-sm transition-all"
              style={{
                height: `${(v / max) * 100}%`,
                background: colorVar,
                opacity: 0.4 + (i / spark.length) * 0.6,
              }}
            />
          ))}
        </div>
      </div>
      <div
        className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-30"
        style={{ background: colorVar }}
      />
    </div>
  );
}

function StagePill({ stage }: { stage: string }) {
  const map: Record<string, string> = {
    "Closed Won": "var(--cyber-green)",
    Commit: "var(--electric-blue)",
    Negotiation: "var(--neon-pink)",
    Proposal: "var(--violet-glow)",
    Discovery: "var(--warning-amber)",
    Stalled: "var(--destructive)",
  };
  const c = map[stage] ?? "var(--muted-foreground)";
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border"
      style={{ color: c, borderColor: `color-mix(in oklab, ${c} 45%, transparent)`, background: `color-mix(in oklab, ${c} 12%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {stage}
    </span>
  );
}

function ProbabilityBar({ value }: { value: number }) {
  const c =
    value >= 75 ? "var(--cyber-green)" : value >= 40 ? "var(--warning-amber)" : "var(--destructive)";
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: c, boxShadow: `0 0 8px ${c}` }}
        />
      </div>
      <span className="text-xs font-mono w-8 text-right" style={{ color: c }}>
        {value}%
      </span>
    </div>
  );
}

/* ---------- Tiny syntax highlighters (no deps) ---------- */

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

type GraphQLToken = {
  text: string;
  type: "plain" | "comment" | "keyword" | "variable" | "scalar" | "string" | "field" | "punct";
};

function tokenizeGraphQLLine(line: string): GraphQLToken[] {
  const tokens: GraphQLToken[] = [];
  const pattern = /(#.*$)|("(?:[^"\\]|\\.)*")|(\$[A-Za-z_][A-Za-z0-9_]*)|\b(query|mutation|subscription|fragment|on)\b|\b(Int|String|Float|Boolean|ID)\b|([{}()[\]:!,])|([A-Za-z_][A-Za-z0-9_]*)(?=\s*[:({])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: line.slice(lastIndex, match.index), type: "plain" });
    }

    const text = match[0];
    let type: GraphQLToken["type"] = "plain";
    if (match[1]) type = "comment";
    else if (match[2]) type = "string";
    else if (match[3]) type = "variable";
    else if (match[4]) type = "keyword";
    else if (match[5]) type = "scalar";
    else if (match[6]) type = "punct";
    else if (match[7]) type = "field";

    tokens.push({ text, type });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({ text: line.slice(lastIndex), type: "plain" });
  }

  return tokens.length ? tokens : [{ text: line, type: "plain" }];
}

function graphQLTokenClass(type: GraphQLToken["type"]) {
  const classes: Record<GraphQLToken["type"], string> = {
    plain: "text-foreground",
    comment: "text-muted-foreground italic",
    keyword: "text-[var(--neon-pink)] font-semibold",
    variable: "text-[var(--warning-amber)]",
    scalar: "text-[var(--violet-glow)]",
    string: "text-[var(--cyber-green)]",
    field: "text-[var(--electric-blue)]",
    punct: "text-muted-foreground",
  };
  return classes[type];
}

function highlightJSON(src: string) {
  const esc = escapeHtml(src);
  return esc
    .replace(/("(?:[^"\\]|\\.)*")\s*:/g, `<span style="color:var(--electric-blue)">$1</span>:`)
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g, `: <span style="color:var(--cyber-green)">$1</span>`)
    .replace(/\b(true|false|null)\b/g, `<span style="color:var(--neon-pink)">$1</span>`)
    .replace(/(:\s*)(-?\d+(?:\.\d+)?)/g, `$1<span style="color:var(--warning-amber)">$2</span>`);
}
