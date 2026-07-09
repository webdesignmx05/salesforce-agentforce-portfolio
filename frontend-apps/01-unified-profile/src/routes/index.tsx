import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
  TrendingUp,
  Activity,
  Clock,
  ShoppingCart,
  MousePointerClick,
  Mail as MailIcon,
  Headphones,
  Sparkles,
  ArrowUpRight,
  Database,
  RefreshCw,
  Server,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Unified Customer Profile · Data Cloud" },
      {
        name: "description",
        content:
          "Premium Salesforce Data Cloud customer profile view with unified insights, engagement scores, and activity ingestion streams.",
      },
    ],
  }),
});

// ============================================================================
// MOCK DATA — Replace with Salesforce Data Cloud API response
// ============================================================================

// ============================================================================
// LIVE SALESFORCE ACCOUNT TYPES
// ============================================================================
type SalesforceAccountRecord = {
  Id: string;
  Name: string;
};

type LiveAccountsState = {
  loading: boolean;
  error: string | null;
  records: SalesforceAccountRecord[];
  lastUpdated: string | null;
};

const BACKEND_PROXY_URL = import.meta.env.VITE_BACKEND_PROXY_URL as
  | string
  | undefined;

async function fetchLiveSalesforceAccounts(): Promise<SalesforceAccountRecord[]> {
  if (!BACKEND_PROXY_URL) {
    throw new Error(
      "Missing VITE_BACKEND_PROXY_URL. Add the Railway backend URL in Vercel Environment Variables.",
    );
  }

  const response = await fetch(`${BACKEND_PROXY_URL}/api/salesforce/soql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: "SELECT Id, Name FROM Account LIMIT 5",
    }),
  });

  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  return Array.isArray(payload.records) ? payload.records : [];
}

const MOCK_PROFILE_DATA = {
  profile: {
    id: "0018c00002abcXYZ",
    name: "Amelia Chen",
    title: "VP of Marketing",
    company: "Northwind Traders",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
    email: "amelia.chen@northwind.com",
    phone: "+1 (415) 555-0142",
    location: "San Francisco, CA",
    unifiedSources: 7,
    identityConfidence: 98,
  },
  metrics: [
    {
      id: "ltv",
      label: "Lifetime Value",
      value: "$142,890",
      delta: "+18.4%",
      trend: "up" as const,
      caption: "Rolling 24-month calculated LTV",
      icon: TrendingUp,
      accent: "from-violet-500 to-indigo-500",
    },
    {
      id: "engagement",
      label: "Engagement Score",
      value: "94",
      suffix: "/100",
      delta: "+6 pts",
      trend: "up" as const,
      caption: "Weighted across 12 signals",
      icon: Activity,
      accent: "from-cyan-500 to-sky-500",
    },
    {
      id: "lastEvent",
      label: "Last Ingested Event",
      value: "2m ago",
      delta: "streaming",
      trend: "live" as const,
      caption: "web.session.pageView · 08 Jul 14:22 UTC",
      icon: Clock,
      accent: "from-fuchsia-500 to-pink-500",
    },
  ],
  activities: [
    {
      id: "evt_01",
      type: "purchase",
      title: "Order #A-49281 confirmed",
      source: "Commerce Cloud",
      value: "$2,480.00",
      timestamp: "2 min ago",
      icon: ShoppingCart,
      accent: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
    },
    {
      id: "evt_02",
      type: "web",
      title: "Viewed pricing page · 4 sessions",
      source: "Web SDK",
      value: "Enterprise plan",
      timestamp: "14 min ago",
      icon: MousePointerClick,
      accent: "text-cyan-300 bg-cyan-500/10 ring-cyan-500/20",
    },
    {
      id: "evt_03",
      type: "email",
      title: "Opened campaign · Q3 Product Launch",
      source: "Marketing Cloud",
      value: "CTR 12.4%",
      timestamp: "1 hr ago",
      icon: MailIcon,
      accent: "text-violet-300 bg-violet-500/10 ring-violet-500/20",
    },
    {
      id: "evt_04",
      type: "support",
      title: "Case #77812 resolved · CSAT 5/5",
      source: "Service Cloud",
      value: "12 min handle time",
      timestamp: "3 hrs ago",
      icon: Headphones,
      accent: "text-fuchsia-300 bg-fuchsia-500/10 ring-fuchsia-500/20",
    },
    {
      id: "evt_05",
      type: "ai",
      title: "Einstein: propensity to upsell → 0.87",
      source: "Data Cloud AI",
      value: "High confidence",
      timestamp: "5 hrs ago",
      icon: Sparkles,
      accent: "text-amber-300 bg-amber-500/10 ring-amber-500/20",
    },
    {
      id: "evt_06",
      type: "purchase",
      title: "Renewal auto-processed · Annual",
      source: "Revenue Cloud",
      value: "$18,000.00",
      timestamp: "Yesterday",
      icon: ShoppingCart,
      accent: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
    },
  ],
};

function Index() {
  // The original Lovable visual demo remains mock-driven.
  // This live panel proves the browser can call Railway, and Railway can query Salesforce.
  const [data] = useState(MOCK_PROFILE_DATA);
  const [liveAccounts, setLiveAccounts] = useState<LiveAccountsState>({
    loading: false,
    error: null,
    records: [],
    lastUpdated: null,
  });
  const { profile, metrics, activities } = data;

  const loadLiveAccounts = async () => {
    setLiveAccounts((current) => ({ ...current, loading: true, error: null }));
    try {
      const records = await fetchLiveSalesforceAccounts();
      setLiveAccounts({
        loading: false,
        error: null,
        records,
        lastUpdated: new Date().toLocaleString(),
      });
    } catch (error) {
      setLiveAccounts((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown live Salesforce error",
      }));
    }
  };

  useEffect(() => {
    loadLiveAccounts();
  }, []);

  return (
    <div className="min-h-screen bg-[#07070d] text-slate-100 antialiased">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-indigo-500/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-lg shadow-violet-500/30">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-widest text-slate-400 uppercase">
                Data Cloud
              </p>
              <h1 className="text-lg font-semibold text-white">
                Unified Customer Profile
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live · streaming ingest
          </div>
        </header>

        {/* Unified Profile Card */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.12),transparent_50%)]" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 opacity-80 blur-sm" />
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="relative h-24 w-24 rounded-full border-2 border-white/20 object-cover"
                />
                <div className="absolute right-0 bottom-0 grid h-7 w-7 place-items-center rounded-full border-2 border-[#07070d] bg-gradient-to-br from-cyan-400 to-indigo-500">
                  <BadgeCheck className="h-4 w-4 text-white" />
                </div>
              </div>

              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-200 uppercase backdrop-blur">
                  <Sparkles className="h-3 w-3" />
                  Data Cloud Synthesized
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  {profile.name}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {profile.title} · {profile.company}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-slate-500" />
                    {profile.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-slate-500" />
                    {profile.phone}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {profile.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-6 border-t border-white/10 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <div>
                <p className="text-xs tracking-wide text-slate-400 uppercase">
                  Unified Sources
                </p>
                <p className="mt-1 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-3xl font-semibold text-transparent">
                  {profile.unifiedSources}
                </p>
              </div>
              <div className="border-l border-white/10 pl-6">
                <p className="text-xs tracking-wide text-slate-400 uppercase">
                  Identity Match
                </p>
                <p className="mt-1 bg-gradient-to-br from-cyan-300 to-violet-400 bg-clip-text text-3xl font-semibold text-transparent">
                  {profile.identityConfidence}%
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Metric Cards */}
        <section className="mb-8 grid gap-5 md:grid-cols-3">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div
                  className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${m.accent} opacity-20 blur-2xl transition-opacity group-hover:opacity-30`}
                />
                <div className="relative flex items-start justify-between">
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${m.accent} shadow-lg`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      m.trend === "live"
                        ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20"
                        : "bg-white/5 text-slate-300 ring-1 ring-white/10"
                    }`}
                  >
                    {m.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                    {m.trend === "live" && (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    )}
                    {m.delta}
                  </span>
                </div>
                <p className="relative mt-6 text-sm text-slate-400">{m.label}</p>
                <p className="relative mt-1 flex items-baseline gap-1 text-3xl font-semibold tracking-tight text-white">
                  {m.value}
                  {m.suffix && (
                    <span className="text-lg font-medium text-slate-500">
                      {m.suffix}
                    </span>
                  )}
                </p>
                <p className="relative mt-3 text-xs text-slate-500">{m.caption}</p>
              </div>
            );
          })}
        </section>

        {/* Live Salesforce Proof Panel */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.04] backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-emerald-400/10 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/25">
                <Server className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-emerald-200 uppercase ring-1 ring-emerald-400/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Live Salesforce Proxy Test
                </div>
                <h3 className="text-base font-semibold text-white">
                  Live Account Records from Salesforce
                </h3>
                <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-400">
                  This panel calls the Railway backend proxy, which authenticates
                  with Salesforce using server-side credentials and runs a safe
                  SOQL query. No Salesforce secrets are stored in the React app.
                </p>
              </div>
            </div>

            <button
              onClick={loadLiveAccounts}
              disabled={liveAccounts.loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-100 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${liveAccounts.loading ? "animate-spin" : ""}`}
              />
              {liveAccounts.loading ? "Refreshing..." : "Refresh Live Data"}
            </button>
          </div>

          <div className="px-6 py-5">
            {liveAccounts.error ? (
              <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Live Salesforce request did not complete.</p>
                  <p className="mt-1 text-xs text-amber-100/80">{liveAccounts.error}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-5">
                  {liveAccounts.records.map((account) => (
                    <div
                      key={account.Id}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.07]"
                    >
                      <p className="text-sm font-medium leading-snug text-white">
                        {account.Name}
                      </p>
                      <p className="mt-2 font-mono text-[10px] text-slate-500">
                        {account.Id}
                      </p>
                    </div>
                  ))}
                </div>

                {!liveAccounts.loading && liveAccounts.records.length === 0 && (
                  <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                    No Account records returned yet. Confirm live mode is enabled
                    in Railway and that the SOQL test works from Cmder.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span>SOQL: SELECT Id, Name FROM Account LIMIT 5</span>
                  {liveAccounts.lastUpdated && (
                    <span>Last updated: {liveAccounts.lastUpdated}</span>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Activity Timeline */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-white">
                Recent Unified Activity Ingestions
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Real-time stream from all connected data sources
              </p>
            </div>
            <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10">
              View all
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {activities.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.id}
                  className="group grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="col-span-12 flex items-center gap-3 md:col-span-6">
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ${a.accent}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {a.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{a.source}</p>
                    </div>
                  </div>
                  <div className="col-span-6 text-sm text-slate-300 md:col-span-3">
                    {a.value}
                  </div>
                  <div className="col-span-6 flex items-center justify-end gap-2 text-xs text-slate-500 md:col-span-3">
                    <Clock className="h-3.5 w-3.5" />
                    {a.timestamp}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="mt-8 text-center text-xs text-slate-600">
          Salesforce Data Cloud · Profile hydrated from{" "}
          {profile.unifiedSources} sources
        </footer>
      </div>
    </div>
  );
}
