import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  X,
  Eye,
  Users,
  BriefcaseBusiness,
  FileText,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Unified Customer Profile · Data Cloud" },
      {
        name: "description",
        content:
          "Premium Salesforce Data Cloud customer profile view with unified insights, engagement scores, and controlled live Salesforce query demos.",
      },
    ],
  }),
});

// ============================================================================
// LIVE SALESFORCE CONTROLLED QUERY TYPES
// ============================================================================
const BACKEND_PROXY_URL = import.meta.env.VITE_BACKEND_PROXY_URL as
  | string
  | undefined;

const PROFILE_QUERY_OPTIONS = {
  accounts: {
    label: "Accounts",
    shortLabel: "Account",
    helper: "Company-level CRM profile records",
    icon: Database,
    accent: "from-emerald-400 to-cyan-400",
    safeQuery:
      "SELECT Id, Name, Industry, Type, Website, Phone, Owner.Name FROM Account LIMIT {limit}",
  },
  contacts: {
    label: "Contacts",
    shortLabel: "Contact",
    helper: "People records tied to accounts",
    icon: Users,
    accent: "from-cyan-400 to-blue-400",
    safeQuery:
      "SELECT Id, Name, Email, Title, Phone, Account.Name FROM Contact LIMIT {limit}",
  },
  opportunities: {
    label: "Opportunities",
    shortLabel: "Opportunity",
    helper: "Pipeline records and revenue context",
    icon: BriefcaseBusiness,
    accent: "from-violet-400 to-fuchsia-400",
    safeQuery:
      "SELECT Id, Name, StageName, Amount, CloseDate, Account.Name FROM Opportunity LIMIT {limit}",
  },
  cases: {
    label: "Cases",
    shortLabel: "Case",
    helper: "Service and support context",
    icon: ShieldCheck,
    accent: "from-amber-300 to-orange-400",
    safeQuery:
      "SELECT Id, CaseNumber, Subject, Status, Priority, Account.Name FROM Case LIMIT {limit}",
  },
} as const;

type ProfileQueryKey = keyof typeof PROFILE_QUERY_OPTIONS;
type SortKey = "id" | "name" | "objectType" | "summary";
type SortDirection = "asc" | "desc";

type SafeProfileRecord = {
  id: string;
  objectType: string;
  name: string;
  summary: string;
  source: string;
  fields: Record<string, string>;
};

type LiveProfileQueryState = {
  loading: boolean;
  error: string | null;
  mode: "not-run" | "mock" | "live";
  queryKey: ProfileQueryKey;
  requestedQuery: string | null;
  records: SafeProfileRecord[];
  lastUpdated: string | null;
};

type DetailRow = {
  label: string;
  value: string;
  source: string;
};

type DetailOverlay = {
  title: string;
  subtitle: string;
  badge: string;
  source: string;
  rows: DetailRow[];
  note: string;
} | null;

async function fetchControlledProfileRecords(
  queryKey: ProfileQueryKey,
  limit: number,
): Promise<{
  mode: "mock" | "live";
  queryKey: ProfileQueryKey;
  requestedQuery: string;
  records: SafeProfileRecord[];
}> {
  if (!BACKEND_PROXY_URL) {
    throw new Error(
      "Missing VITE_BACKEND_PROXY_URL. Add the Railway backend URL in Vercel Environment Variables.",
    );
  }

  const response = await fetch(`${BACKEND_PROXY_URL}/api/salesforce/profile-query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queryKey, limit }),
  });

  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  return {
    mode: payload.mode === "live" ? "live" : "mock",
    queryKey: (payload.requestedControls?.queryKey || queryKey) as ProfileQueryKey,
    requestedQuery: payload.requestedQuery || "",
    records: Array.isArray(payload.records) ? payload.records : [],
  };
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
      detailRows: [
        { label: "Source blend", value: "Commerce + Revenue Cloud", source: "Simulated Data Cloud model" },
        { label: "Calculation window", value: "Rolling 24 months", source: "Portfolio calculation note" },
        { label: "Confidence", value: "High", source: "Mock unified profile signal" },
      ],
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
      detailRows: [
        { label: "Weighted signals", value: "12", source: "Simulated scoring model" },
        { label: "Recent email behavior", value: "Opened Q3 launch campaign", source: "Marketing Cloud mock event" },
        { label: "Recent web behavior", value: "Viewed pricing page", source: "Web SDK mock event" },
      ],
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
      detailRows: [
        { label: "Event type", value: "web.session.pageView", source: "Web SDK mock stream" },
        { label: "Processing status", value: "Ingested", source: "Simulated ingestion pipeline" },
        { label: "Latency", value: "2 minutes", source: "Portfolio UI state" },
      ],
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

function normalizeSortValue(value: string) {
  return value.toLowerCase().replace(/[$,]/g, "");
}

function createRecordOverlay(record: SafeProfileRecord): DetailOverlay {
  return {
    title: record.name,
    subtitle: `${record.objectType} · ${record.id}`,
    badge: record.objectType,
    source: record.source,
    rows: Object.entries(record.fields).map(([label, value]) => ({
      label,
      value: value || "—",
      source: record.source,
    })),
    note:
      "This drilldown uses a controlled Railway proxy response. The browser receives sanitized record fields, not Salesforce credentials or unrestricted SOQL access.",
  };
}

function SortButton({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-left text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase transition-colors hover:text-white"
    >
      {label}
      {active ? (
        direction === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )
      ) : null}
    </button>
  );
}

function Index() {
  const [data] = useState(MOCK_PROFILE_DATA);
  const [queryKey, setQueryKey] = useState<ProfileQueryKey>("accounts");
  const [recordLimit, setRecordLimit] = useState(5);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({ key: "name", direction: "asc" });
  const [detailOverlay, setDetailOverlay] = useState<DetailOverlay>(null);
  const [liveQueryState, setLiveQueryState] = useState<LiveProfileQueryState>({
    loading: false,
    error: null,
    mode: "not-run",
    queryKey: "accounts",
    requestedQuery: null,
    records: [],
    lastUpdated: null,
  });
  const { profile, metrics, activities } = data;

  const visibleQuery =
    liveQueryState.requestedQuery ||
    PROFILE_QUERY_OPTIONS[queryKey].safeQuery.replace("{limit}", String(recordLimit));

  const sortedRecords = useMemo(() => {
    return [...liveQueryState.records].sort((a, b) => {
      const aValue = normalizeSortValue(String(a[sortConfig.key] || ""));
      const bValue = normalizeSortValue(String(b[sortConfig.key] || ""));
      const comparison = aValue.localeCompare(bValue, undefined, { numeric: true });
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [liveQueryState.records, sortConfig]);

  const runControlledQuery = async (
    selectedKey = queryKey,
    selectedLimit = recordLimit,
  ) => {
    setLiveQueryState((current) => ({
      ...current,
      loading: true,
      error: null,
      queryKey: selectedKey,
    }));

    try {
      const result = await fetchControlledProfileRecords(selectedKey, selectedLimit);
      setLiveQueryState({
        loading: false,
        error: null,
        mode: result.mode,
        queryKey: result.queryKey,
        requestedQuery: result.requestedQuery,
        records: result.records,
        lastUpdated: new Date().toLocaleString(),
      });
    } catch (error) {
      setLiveQueryState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown live Salesforce error",
      }));
    }
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const openMetricOverlay = (metric: (typeof metrics)[number]) => {
    setDetailOverlay({
      title: metric.label,
      subtitle: `${metric.value}${metric.suffix || ""} · ${metric.caption}`,
      badge: "Unified Insight",
      source: "Simulated Data Cloud profile model",
      rows: [
        { label: "Current value", value: `${metric.value}${metric.suffix || ""}`, source: "Portfolio UI state" },
        { label: "Change", value: metric.delta, source: "Mock trend indicator" },
        ...metric.detailRows,
      ],
      note:
        "This insight drilldown is simulated to demonstrate how unified profile signals could be explained in a recruiter-facing portfolio UI.",
    });
  };

  const openActivityOverlay = (activity: (typeof activities)[number]) => {
    setDetailOverlay({
      title: activity.title,
      subtitle: `${activity.source} · ${activity.timestamp}`,
      badge: "Activity Event",
      source: activity.source,
      rows: [
        { label: "Event ID", value: activity.id, source: "Mock activity stream" },
        { label: "Event type", value: activity.type, source: activity.source },
        { label: "Value", value: activity.value, source: activity.source },
        { label: "Timestamp", value: activity.timestamp, source: "Portfolio UI state" },
      ],
      note:
        "This event is mock-driven, but the drilldown pattern demonstrates how activity-level provenance can be exposed without revealing internal systems or credentials.",
    });
  };

  useEffect(() => {
    runControlledQuery("accounts", 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#07070d] text-slate-100 antialiased">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-indigo-500/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
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
            Live proxy · controlled queries
          </div>
        </header>

        <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.12),transparent_50%)]" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() =>
                  setDetailOverlay({
                    title: profile.name,
                    subtitle: `${profile.title} · ${profile.company}`,
                    badge: "Unified Profile",
                    source: "Simulated Data Cloud identity resolution",
                    rows: [
                      { label: "Profile ID", value: profile.id, source: "Mock Data Cloud profile" },
                      { label: "Email", value: profile.email, source: "Identity graph" },
                      { label: "Phone", value: profile.phone, source: "Identity graph" },
                      { label: "Location", value: profile.location, source: "Identity graph" },
                      { label: "Unified sources", value: String(profile.unifiedSources), source: "Profile stitching model" },
                      { label: "Identity match", value: `${profile.identityConfidence}%`, source: "Mock confidence score" },
                    ],
                    note:
                      "This profile card is simulated, while the query lab below proves a live Railway-to-Salesforce connection using controlled server-side queries.",
                  })
                }
                className="group relative shrink-0 text-left"
              >
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 opacity-80 blur-sm transition-opacity group-hover:opacity-100" />
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="relative h-24 w-24 rounded-full border-2 border-white/20 object-cover"
                />
                <div className="absolute right-0 bottom-0 grid h-7 w-7 place-items-center rounded-full border-2 border-[#07070d] bg-gradient-to-br from-cyan-400 to-indigo-500">
                  <BadgeCheck className="h-4 w-4 text-white" />
                </div>
              </button>

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
                  <button
                    type="button"
                    onClick={() => setDetailOverlay({
                      title: "Email Identity Signal",
                      subtitle: profile.email,
                      badge: "Identity Field",
                      source: "Mock identity graph",
                      rows: [
                        { label: "Email", value: profile.email, source: "Identity graph" },
                        { label: "Usage", value: "Profile matching + campaign personalization", source: "Portfolio explanation" },
                      ],
                      note: "Field-level clickability demonstrates how a unified profile interface can expose provenance without exposing sensitive implementation details.",
                    })}
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-cyan-200"
                  >
                    <Mail className="h-4 w-4 text-slate-500" />
                    {profile.email}
                  </button>
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
              <button
                type="button"
                onClick={() => setDetailOverlay({
                  title: "Unified Sources",
                  subtitle: `${profile.unifiedSources} systems represented`,
                  badge: "Source Stitching",
                  source: "Simulated Data Cloud architecture",
                  rows: [
                    { label: "Commerce", value: "Purchase + order signals", source: "Mock source system" },
                    { label: "Marketing", value: "Email engagement", source: "Mock source system" },
                    { label: "Service", value: "Cases + satisfaction", source: "Mock source system" },
                    { label: "Web", value: "Session behavior", source: "Mock source system" },
                  ],
                  note: "The source count is simulated. The live query lab below uses real Salesforce records through Railway.",
                })}
                className="text-left"
              >
                <p className="text-xs tracking-wide text-slate-400 uppercase">
                  Unified Sources
                </p>
                <p className="mt-1 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-3xl font-semibold text-transparent">
                  {profile.unifiedSources}
                </p>
              </button>
              <button
                type="button"
                onClick={() => setDetailOverlay({
                  title: "Identity Match Confidence",
                  subtitle: `${profile.identityConfidence}% confidence score`,
                  badge: "Identity Resolution",
                  source: "Simulated matching model",
                  rows: [
                    { label: "Email match", value: "High", source: "Mock identity graph" },
                    { label: "Phone match", value: "Medium", source: "Mock identity graph" },
                    { label: "Behavior match", value: "High", source: "Mock activity stream" },
                  ],
                  note: "This demonstrates the kind of explainability panel a unified profile dashboard can provide.",
                })}
                className="border-l border-white/10 pl-6 text-left"
              >
                <p className="text-xs tracking-wide text-slate-400 uppercase">
                  Identity Match
                </p>
                <p className="mt-1 bg-gradient-to-br from-cyan-300 to-violet-400 bg-clip-text text-3xl font-semibold text-transparent">
                  {profile.identityConfidence}%
                </p>
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-5 md:grid-cols-3">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => openMetricOverlay(m)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
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
                <span className="relative mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-cyan-200/80">
                  <Eye className="h-3.5 w-3.5" /> Drill into signal
                </span>
              </button>
            );
          })}
        </section>

        <section className="mb-8 overflow-hidden rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.04] backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-emerald-400/10 px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/25">
                <Server className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-emerald-200 uppercase ring-1 ring-emerald-400/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Controlled Live Salesforce Query Lab
                </div>
                <h3 className="text-base font-semibold text-white">
                  Safe Live Records from Salesforce
                </h3>
                <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-400">
                  Choose an allowlisted object and record limit. The browser sends
                  only safe options to Railway; Railway builds the SOQL query,
                  authenticates with Salesforce, and returns sanitized records.
                </p>
              </div>
            </div>

            <button
              onClick={() => runControlledQuery()}
              disabled={liveQueryState.loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-100 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${liveQueryState.loading ? "animate-spin" : ""}`}
              />
              {liveQueryState.loading ? "Running..." : "Run Controlled Query"}
            </button>
          </div>

          <div className="border-b border-emerald-400/10 px-6 py-5">
            <div className="grid gap-3 md:grid-cols-4">
              {(Object.keys(PROFILE_QUERY_OPTIONS) as ProfileQueryKey[]).map((key) => {
                const option = PROFILE_QUERY_OPTIONS[key];
                const Icon = option.icon;
                const isActive = key === queryKey;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setQueryKey(key);
                      runControlledQuery(key, recordLimit);
                    }}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      isActive
                        ? "border-emerald-300/50 bg-emerald-400/10 text-white"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div
                      className={`mb-3 grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${option.accent}`}
                    >
                      <Icon className="h-4 w-4 text-[#07070d]" />
                    </div>
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {option.helper}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <label className="text-xs font-medium text-slate-300">
                Record limit
                <select
                  value={recordLimit}
                  onChange={(event) => {
                    const nextLimit = Number(event.target.value);
                    setRecordLimit(nextLimit);
                    runControlledQuery(queryKey, nextLimit);
                  }}
                  className="mt-2 block w-full rounded-lg border border-white/10 bg-[#0f1220] px-3 py-2 text-sm text-white outline-none ring-emerald-400/20 focus:ring-2 lg:w-44"
                >
                  <option value={3}>3 records</option>
                  <option value={5}>5 records</option>
                  <option value={10}>10 records</option>
                </select>
              </label>

              <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#050816] p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold tracking-[0.18em] text-cyan-300 uppercase">
                    Server-built safe SOQL
                  </span>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-slate-500">
                    {liveQueryState.mode === "live" ? "LIVE" : liveQueryState.mode === "mock" ? "MOCK" : "READY"}
                  </span>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-300">
                  {visibleQuery}
                </pre>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            {liveQueryState.error ? (
              <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Live Salesforce request did not complete.</p>
                  <p className="mt-1 text-xs text-amber-100/80">{liveQueryState.error}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="min-w-full divide-y divide-white/10 text-sm">
                    <thead className="bg-white/[0.03]">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <SortButton label="Salesforce ID" active={sortConfig.key === "id"} direction={sortConfig.direction} onClick={() => handleSort("id")} />
                        </th>
                        <th className="px-4 py-3 text-left">
                          <SortButton label="Record Name" active={sortConfig.key === "name"} direction={sortConfig.direction} onClick={() => handleSort("name")} />
                        </th>
                        <th className="px-4 py-3 text-left">
                          <SortButton label="Object" active={sortConfig.key === "objectType"} direction={sortConfig.direction} onClick={() => handleSort("objectType")} />
                        </th>
                        <th className="px-4 py-3 text-left">
                          <SortButton label="Summary" active={sortConfig.key === "summary"} direction={sortConfig.direction} onClick={() => handleSort("summary")} />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedRecords.map((record) => (
                        <tr key={`${record.objectType}-${record.id}`} className="transition-colors hover:bg-white/[0.03]">
                          <td className="px-4 py-3 align-top">
                            <button
                              type="button"
                              onClick={() => setDetailOverlay(createRecordOverlay(record))}
                              className="font-mono text-xs font-semibold text-cyan-300 underline-offset-4 hover:text-cyan-100 hover:underline"
                            >
                              {record.id}
                            </button>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <button
                              type="button"
                              onClick={() => setDetailOverlay(createRecordOverlay(record))}
                              className="text-left font-medium text-white underline-offset-4 hover:text-cyan-100 hover:underline"
                            >
                              {record.name}
                            </button>
                          </td>
                          <td className="px-4 py-3 align-top text-slate-400">{record.objectType}</td>
                          <td className="px-4 py-3 align-top text-slate-400">{record.summary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!liveQueryState.loading && liveQueryState.records.length === 0 && (
                  <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                    No records returned for this controlled query. Try a different
                    object type or confirm this Developer Edition org contains
                    sample data for that object.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span>Mode: {liveQueryState.mode === "live" ? "Live response" : liveQueryState.mode === "mock" ? "Mock response" : "Ready"}</span>
                  <span>Credentials: Railway only</span>
                  {liveQueryState.lastUpdated && (
                    <span>Last updated: {liveQueryState.lastUpdated}</span>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-white">
                Recent Unified Activity Ingestions
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Click any event to inspect the mocked source/provenance detail
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
                <button
                  type="button"
                  key={a.id}
                  onClick={() => openActivityOverlay(a)}
                  className="group grid w-full grid-cols-12 items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <div className="col-span-12 flex items-center gap-3 md:col-span-6">
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ${a.accent}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white group-hover:text-cyan-100">
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
                </button>
              );
            })}
          </div>
        </section>

        <footer className="mt-8 text-center text-xs text-slate-600">
          Salesforce Data Cloud · Profile hydrated from {profile.unifiedSources} sources · Live query lab uses Railway-controlled Salesforce SOQL
        </footer>
      </div>

      {detailOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#0b0f1d] shadow-2xl shadow-cyan-500/10">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.03] px-6 py-5">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-cyan-200 uppercase">
                  {detailOverlay.badge}
                </div>
                <h2 className="text-2xl font-semibold text-white">{detailOverlay.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{detailOverlay.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailOverlay(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close detail overlay"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[68vh] overflow-y-auto px-6 py-5">
              <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
                  Source
                </p>
                <p className="mt-1 text-sm text-slate-300">{detailOverlay.source}</p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="min-w-full divide-y divide-white/10 text-sm">
                  <thead className="bg-white/[0.04]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Field</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Value</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {detailOverlay.rows.map((row) => (
                      <tr key={`${row.label}-${row.value}`}>
                        <td className="px-4 py-3 font-medium text-white">{row.label}</td>
                        <td className="px-4 py-3 text-slate-300">{row.value}</td>
                        <td className="px-4 py-3 text-slate-500">{row.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm leading-relaxed text-emerald-100/90">
                {detailOverlay.note}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
