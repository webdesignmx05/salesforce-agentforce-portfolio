import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Activity,
  Bot,
  ChevronDown,
  Cpu,
  Database,
  Send,
  Shield,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

type Source = { label: string; kind: "dmo" | "soql" | "knowledge" | "api" };

type Message = {
  id: string;
  role: "user" | "agent";
  text: string;
  sources?: Source[];
  timestamp: string;
};

const seedMessages: Message[] = [
  {
    id: "seed-1",
    role: "agent",
    text:
      "Hi — I'm your Agentforce assistant. Ask me about pipeline health, account insights, or next best actions. I'll ground every answer in your connected Data Cloud objects.",
    sources: [
      { label: "Data Cloud DMO · Account_Home__dlm", kind: "dmo" },
      { label: "Standard SOQL · Contact", kind: "soql" },
      { label: "Knowledge Article KA-00421", kind: "knowledge" },
    ],
    timestamp: nowStamp(),
  },
];

const mockReplies: { text: string; sources: Source[] }[] = [
  {
    text:
      "Based on the last 90 days of pipeline data, three enterprise opportunities are at risk of slipping. I recommend logging a discovery call with the Northwind account today and updating the close date on Acme — Renewal.",
    sources: [
      { label: "Data Cloud DMO · Opportunity_Unified__dlm", kind: "dmo" },
      { label: "Standard SOQL · Opportunity", kind: "soql" },
      { label: "Einstein Activity Capture", kind: "api" },
    ],
  },
  {
    text:
      "The contact you mentioned has an open case (Case #00104829) escalated to Tier 2 yesterday. Sentiment on the latest email thread is negative — I can draft a response grounded in KB-2210 if you'd like.",
    sources: [
      { label: "Standard SOQL · Case", kind: "soql" },
      { label: "Data Cloud DMO · Email_Engagement__dlm", kind: "dmo" },
      { label: "Knowledge Article KB-2210", kind: "knowledge" },
    ],
  },
  {
    text:
      "Here's the summary: 42 new leads this week, 18 MQL-qualified. Top source is the Dreamforce landing page. Guardrails prevented me from sharing 3 records outside your sharing scope.",
    sources: [
      { label: "Data Cloud DMO · Lead_Engagement__dlm", kind: "dmo" },
      { label: "Standard SOQL · Lead", kind: "soql" },
      { label: "Marketing Cloud Journey API", kind: "api" },
    ],
  },
];

function nowStamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function AgentforceChat() {
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || pending) return;
    const userMsg: Message = {
      id: uid(),
      role: "user",
      text: trimmed,
      timestamp: nowStamp(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setPending(true);
    const reply = mockReplies[Math.floor(Math.random() * mockReplies.length)];
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "agent",
          text: reply.text,
          sources: reply.sources,
          timestamp: nowStamp(),
        },
      ]);
      setPending(false);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[oklch(0.18_0.03_220)] text-slate-100">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[oklch(0.55_0.25_300)] opacity-30 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-[oklch(0.65_0.18_190)] opacity-25 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-[380px] w-[380px] rounded-full bg-[oklch(0.6_0.22_320)] opacity-20 blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 p-4 lg:flex-row lg:p-8">
        <AgentStatusPanel />
        <ChatWindow
          messages={messages}
          input={input}
          setInput={setInput}
          onSubmit={onSubmit}
          pending={pending}
          scrollRef={scrollRef}
        />
      </div>
    </div>
  );
}

function AgentStatusPanel() {
  return (
    <aside className="w-full shrink-0 lg:w-[320px]">
      <div className="sticky top-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-[oklch(0.6_0.22_310)] blur-md opacity-70" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.6_0.22_310)] to-[oklch(0.55_0.2_260)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Agentforce</div>
            <div className="flex items-center gap-1.5 text-xs text-teal-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-400" />
              </span>
              Live · Healthy
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <StatusRow icon={Cpu} label="Model" value="Salesforce xLAM-2" tone="purple" />
        <StatusRow icon={Zap} label="Rate Limit" value="150 / hr remaining" tone="teal" progress={0.72} />
        <StatusRow icon={Shield} label="Session Guardrails" value="Enforced" tone="teal" />
        <StatusRow icon={Database} label="Data Cloud" value="12 DMOs connected" tone="purple" />
        <StatusRow icon={Activity} label="Avg Latency" value="842 ms" tone="teal" />

        <div className="rounded-xl border border-purple-400/20 bg-gradient-to-br from-purple-500/10 to-teal-500/5 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-purple-300">
            Active Topics
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Pipeline", "Cases", "Accounts", "Forecasting"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatusRow({
  icon: Icon,
  label,
  value,
  tone,
  progress,
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
  tone: "teal" | "purple";
  progress?: number;
}) {
  const glow =
    tone === "teal"
      ? "from-[oklch(0.7_0.15_190)] to-[oklch(0.5_0.15_210)]"
      : "from-[oklch(0.65_0.22_310)] to-[oklch(0.5_0.2_270)]";
  const bar =
    tone === "teal" ? "bg-teal-400" : "bg-purple-400";
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${glow}`}>
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            {label}
          </div>
          <div className="truncate text-sm font-medium text-slate-100">{value}</div>
        </div>
      </div>
      {typeof progress === "number" && (
        <div className="mt-2 ml-11 h-1 overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full ${bar}`}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ChatWindow({
  messages,
  input,
  setInput,
  onSubmit,
  pending,
  scrollRef,
}: {
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  pending: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className="flex min-h-[85vh] flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
      <header className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-4">
        <div>
          <h1 className="text-base font-semibold tracking-tight">Agent Console</h1>
          <p className="text-xs text-slate-400">Grounded responses · Trust Layer active</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs text-teal-300">
          <Shield className="h-3 w-3" /> Guardrails on
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        {messages.map((m) =>
          m.role === "user" ? <UserBubble key={m.id} msg={m} /> : <AgentBubble key={m.id} msg={m} />,
        )}
        {pending && <TypingIndicator />}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-white/10 bg-gradient-to-b from-transparent to-white/[0.03] p-4"
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 p-2 focus-within:border-purple-400/50 focus-within:ring-2 focus-within:ring-purple-400/20">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Agentforce about your pipeline, accounts, or cases…"
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || pending}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.6_0.22_310)] to-[oklch(0.55_0.2_260)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            Send
          </button>
        </div>
      </form>
    </section>
  );
}

function UserBubble({ msg }: { msg: Message }) {
  return (
    <div className="flex justify-end gap-3">
      <div className="max-w-[75%]">
        <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-[oklch(0.55_0.22_305)] to-[oklch(0.45_0.2_265)] px-4 py-3 text-sm text-white shadow-lg shadow-purple-900/30">
          {msg.text}
        </div>
        <div className="mt-1 text-right text-[10px] text-slate-500">{msg.timestamp} · You</div>
      </div>
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-800">
        <User className="h-4 w-4 text-slate-300" />
      </div>
    </div>
  );
}

function AgentBubble({ msg }: { msg: Message }) {
  return (
    <div className="flex gap-3">
      <div className="relative mt-1 shrink-0">
        <div className="absolute inset-0 rounded-full bg-teal-400 blur-md opacity-40" />
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-600">
          <Bot className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="min-w-0 max-w-[75%] flex-1">
        <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-slate-900/60 px-4 py-3 text-sm leading-relaxed text-slate-100 shadow-lg shadow-black/20 backdrop-blur">
          {msg.text}
        </div>
        {msg.sources && <SourcesAccordion sources={msg.sources} />}
        <div className="mt-1 text-[10px] text-slate-500">
          {msg.timestamp} · Agentforce
        </div>
      </div>
    </div>
  );
}

function SourcesAccordion({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-teal-400/20 bg-gradient-to-br from-teal-500/[0.08] to-purple-500/[0.05]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left transition hover:bg-white/[0.03]"
      >
        <span className="flex items-center gap-2 text-xs font-medium text-teal-300">
          <Database className="h-3 w-3" />
          Grounding Data Sources
          <span className="rounded-full bg-teal-400/15 px-1.5 text-[10px] text-teal-200">
            {sources.length}
          </span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-teal-300 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-teal-400/15 px-3 py-3">
          <div className="flex flex-wrap gap-1.5">
            {sources.map((s) => (
              <SourcePill key={s.label} source={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SourcePill({ source }: { source: Source }) {
  const styles: Record<Source["kind"], string> = {
    dmo: "border-purple-400/30 bg-purple-500/10 text-purple-200",
    soql: "border-teal-400/30 bg-teal-500/10 text-teal-200",
    knowledge: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    api: "border-sky-400/30 bg-sky-500/10 text-sky-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[source.kind]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {source.label}
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="relative mt-1 shrink-0">
        <div className="absolute inset-0 rounded-full bg-teal-400 blur-md opacity-40" />
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-600">
          <Bot className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-slate-900/60 px-4 py-3 shadow-lg shadow-black/20">
        <div className="flex items-center gap-1">
          <Dot delay="0ms" />
          <Dot delay="150ms" />
          <Dot delay="300ms" />
        </div>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-300"
      style={{ animationDelay: delay }}
    />
  );
}
