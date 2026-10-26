import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  MessagesSquare,
  RefreshCw,
  ScanSearch,
  Search,
  ShieldCheck,
  User as UserIcon,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuthUser } from "@/hooks/useAuthUser";
import { TONES, tint } from "@/lib/module-tones";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Nexora" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

// Admins sign in with a username; it maps to this email domain in Supabase Auth.
const ADMIN_EMAIL_DOMAIN = "nexora.admin";
const REVIEW_TONE = "#22d3ee";

type UserRow = Database["public"]["Functions"]["admin_list_users"]["Returns"][number];

type Overview = {
  total_users: number;
  verified_users: number;
  new_today: number;
  new_7d: number;
  new_30d: number;
  active_today: number;
  active_7d: number;
  active_30d: number;
  assessments: number;
  interviews: number;
  dsa_quiz_attempts: number;
  dsa_levels_completed: number;
  problems_solved: number;
  resume_reviews: number;
  resumes_built: number;
  avg_assessment_score: number | null;
  avg_interview_score: number | null;
  avg_ats_score: number | null;
  daily: { day: string; signups: number; active: number }[];
  top_technologies: { technology: string; attempts: number; avg_score: number }[];
};

type Detail = {
  assessments: { technology: string; difficulty: string; score: number; at: string }[];
  interviews: { type: string; difficulty: string; score: number; at: string }[];
  dsa_levels: { topic_id: string; level_id: string; quiz_score: number; completed: boolean }[];
  resume_reviews: { file_name: string | null; score: number; at: string }[];
};

type Tab = "overview" | "users";
type Filter = "all" | "verified" | "unverified" | "active";
type SortKey =
  "joined_at" | "last_active_at" | "assessments" | "interviews" | "dsa_levels_completed";

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days < 30 ? `${days}d ago` : fmtDate(iso);
}

const initials = (u: Pick<UserRow, "full_name" | "email">) =>
  (u.full_name || u.email || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const AVATAR_TONES = [TONES.dsa, TONES.assess, TONES.interview, TONES.resume, REVIEW_TONE];
const avatarTone = (id: string) => AVATAR_TONES[id.charCodeAt(0) % AVATAR_TONES.length];

/* ================================== page ================================== */

function AdminPage() {
  const { user, isAdmin, loading } = useAuthUser();
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<UserRow | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    const [o, u] = await Promise.all([
      supabase.rpc("admin_overview"),
      supabase.rpc("admin_list_users"),
    ]);
    setRefreshing(false);
    if (o.error || u.error) {
      setError((o.error ?? u.error)!.message);
      return;
    }
    setError(null);
    setOverview(o.data as unknown as Overview);
    setUsers(u.data ?? []);
  }, []);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  if (loading) return <FullScreenSpinner />;
  if (!user || !isAdmin) return <AdminLogin signedInAs={user?.email ?? null} />;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <Sidebar tab={tab} setTab={setTab} email={user.email ?? ""} usersCount={users.length} />

      <div className="min-w-0">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <AdminLogo />
          <div className="ml-auto flex rounded-xl border border-border/60 p-1">
            {(["overview", "users"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${tab === t ? "bg-surface-2 text-foreground" : "text-muted-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => void supabase.auth.signOut()}
            aria-label="Sign out"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border/60"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {tab === "overview" ? "Overview" : "Users"}
              </p>
              <h1 className="mt-1.5 text-3xl font-semibold tracking-tight md:text-4xl">
                {tab === "overview" ? "Platform overview" : "All users"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={() => void load()}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-surface/50 px-4 py-2 text-sm font-medium hover:bg-surface disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </header>

          {error ? (
            <p className="mt-10 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              Could not load admin data: {error}
            </p>
          ) : !overview ? (
            <div className="grid min-h-[50vh] place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : tab === "overview" ? (
            <OverviewTab
              overview={overview}
              users={users}
              onOpenUser={setSelected}
              onSeeAll={() => setTab("users")}
            />
          ) : (
            <UsersTab users={users} onOpenUser={setSelected} />
          )}
        </main>
      </div>

      <UserSheet user={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

/* ================================ layout ================================== */

function AdminLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="grid h-9 w-9 place-items-center rounded-xl font-black text-primary-foreground shadow-glow"
        style={{ background: "var(--gradient-gold)", fontFamily: "var(--font-display)" }}
      >
        N
      </span>
      <span className="leading-tight">
        <span
          className="block text-sm font-bold tracking-[0.16em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          NEXORA
        </span>
        <span className="block text-[10px] font-semibold tracking-[0.2em] text-primary">ADMIN</span>
      </span>
    </div>
  );
}

function Sidebar({
  tab,
  setTab,
  email,
  usersCount,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  email: string;
  usersCount: number;
}) {
  const items: { id: Tab; label: string; icon: LucideIcon; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users, badge: usersCount },
  ];
  const name = email.endsWith(`@${ADMIN_EMAIL_DOMAIN}`) ? email.split("@")[0] : email;
  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-border/60 bg-surface/30 p-5 backdrop-blur lg:flex">
      <AdminLogo />
      <nav className="mt-10 space-y-1">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              tab === it.id
                ? "bg-primary/15 text-foreground"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
          >
            <it.icon className={`h-4 w-4 ${tab === it.id ? "text-primary" : ""}`} />
            {it.label}
            {it.badge !== undefined && (
              <span className="ml-auto rounded-full bg-surface-2 px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                {it.badge}
              </span>
            )}
          </button>
        ))}
        <Link
          to="/"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-surface hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" /> View website
        </Link>
      </nav>

      <div className="mt-auto rounded-2xl border border-border/60 bg-background/40 p-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{name}</span>
            <span className="block text-xs text-muted-foreground">Administrator</span>
          </span>
        </div>
        <button
          onClick={() => void supabase.auth.signOut()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 py-2 text-sm text-muted-foreground transition hover:border-destructive/50 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}

/* =============================== overview ================================= */

function OverviewTab({
  overview: o,
  users,
  onOpenUser,
  onSeeAll,
}: {
  overview: Overview;
  users: UserRow[];
  onOpenUser: (u: UserRow) => void;
  onSeeAll: () => void;
}) {
  const verifiedRate = o.total_users ? Math.round((o.verified_users / o.total_users) * 100) : 0;
  const usage: { label: string; value: number; tone: string; icon: LucideIcon; sub?: string }[] = [
    {
      label: "Skill assessments",
      value: o.assessments,
      tone: TONES.assess,
      icon: BrainCircuit,
      sub: o.avg_assessment_score != null ? `avg ${o.avg_assessment_score}%` : undefined,
    },
    {
      label: "Mock interviews",
      value: o.interviews,
      tone: TONES.interview,
      icon: MessagesSquare,
      sub: o.avg_interview_score != null ? `avg ${o.avg_interview_score}%` : undefined,
    },
    {
      label: "DSA quiz attempts",
      value: o.dsa_quiz_attempts,
      tone: TONES.dsa,
      icon: BookOpen,
      sub: `${o.dsa_levels_completed} levels done`,
    },
    { label: "Problems solved", value: o.problems_solved, tone: TONES.dsa, icon: Code2 },
    {
      label: "Resume reviews",
      value: o.resume_reviews,
      tone: REVIEW_TONE,
      icon: ScanSearch,
      sub: o.avg_ats_score != null ? `avg ATS ${o.avg_ats_score}` : undefined,
    },
    { label: "Resumes built", value: o.resumes_built, tone: TONES.resume, icon: FileText },
  ];
  const maxUsage = Math.max(1, ...usage.map((u) => u.value));
  const recent = [...users].sort((a, b) => b.joined_at.localeCompare(a.joined_at)).slice(0, 6);
  const daily = o.daily.map((d) => ({
    ...d,
    label: new Date(d.day).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
  }));

  return (
    <div className="mt-8 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi
          icon={Users}
          tone={TONES.dsa}
          label="Total users"
          value={o.total_users}
          sub={`${o.verified_users} verified`}
        />
        <Kpi
          icon={UserPlus}
          tone={TONES.resume}
          label="New this week"
          value={o.new_7d}
          sub={`${o.new_today} today · ${o.new_30d} this month`}
        />
        <Kpi
          icon={Activity}
          tone={TONES.assess}
          label="Active this week"
          value={o.active_7d}
          sub={`${o.active_today} today · ${o.active_30d} this month`}
        />
        <Kpi
          icon={ShieldCheck}
          tone={TONES.interview}
          label="Verified rate"
          value={`${verifiedRate}%`}
          sub={`${o.total_users - o.verified_users} awaiting verification`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        {/* Growth chart */}
        <Card
          title="Growth — last 30 days"
          subtitle="New sign-ups and users who used a feature each day"
        >
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <LegendDot color={TONES.dsa} label="Sign-ups" />
            <LegendDot color={TONES.assess} label="Active users" />
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ left: -24, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gSignups" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor={TONES.dsa} stopOpacity={0.35} />
                    <stop offset="1" stopColor={TONES.dsa} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gActive" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor={TONES.assess} stopOpacity={0.3} />
                    <stop offset="1" stopColor={TONES.assess} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  name="Active users"
                  stroke={TONES.assess}
                  strokeWidth={2}
                  fill="url(#gActive)"
                />
                <Area
                  type="monotone"
                  dataKey="signups"
                  name="Sign-ups"
                  stroke={TONES.dsa}
                  strokeWidth={2}
                  fill="url(#gSignups)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent sign-ups */}
        <Card
          title="Recent sign-ups"
          action={
            <button
              onClick={onSeeAll}
              className="text-xs font-semibold text-primary hover:underline"
            >
              See all
            </button>
          }
        >
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border/50">
              {recent.map((u) => (
                <li key={u.user_id}>
                  <button
                    onClick={() => onOpenUser(u)}
                    className="flex w-full items-center gap-3 py-2.5 text-left"
                  >
                    <Avatar user={u} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 truncate text-sm font-medium">
                        {u.full_name || u.email?.split("@")[0]}
                        {u.email_verified && (
                          <CheckCircle2
                            className="h-3.5 w-3.5 shrink-0"
                            style={{ color: TONES.resume }}
                          />
                        )}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {u.email}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {timeAgo(u.joined_at)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        {/* Feature usage */}
        <Card title="Feature usage" subtitle="Total activity across all users">
          <ul className="mt-5 space-y-4">
            {usage.map((u) => (
              <li key={u.label} className="flex items-center gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                  style={{ background: tint(u.tone, 0.13), color: u.tone }}
                >
                  <u.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate">{u.label}</span>
                    <span className="shrink-0 tabular-nums">
                      <span className="font-semibold">{u.value}</span>
                      {u.sub && <span className="ml-2 text-xs text-muted-foreground">{u.sub}</span>}
                    </span>
                  </span>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(u.value / maxUsage) * 100}%`, background: u.tone }}
                    />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Top technologies */}
        <Card title="Top assessment technologies">
          {o.top_technologies.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No assessments yet.</p>
          ) : (
            <ul className="mt-4 space-y-3.5">
              {o.top_technologies.map((t, i) => (
                <li key={t.technology}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-4 text-xs tabular-nums text-muted-foreground">
                        {i + 1}
                      </span>
                      {t.technology}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {t.attempts} {t.attempts === 1 ? "test" : "tests"} · avg {t.avg_score}%
                    </span>
                  </div>
                  <div className="ml-6 mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${t.avg_score}%`, background: TONES.assess }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ================================= users ================================== */

function UsersTab({ users, onOpenUser }: { users: UserRow[]; onOpenUser: (u: UserRow) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("joined_at");

  const weekAgo = Date.now() - 7 * 864e5;
  const counts = {
    all: users.length,
    verified: users.filter((u) => u.email_verified).length,
    unverified: users.filter((u) => !u.email_verified).length,
    active: users.filter((u) => u.last_active_at && new Date(u.last_active_at).getTime() > weekAgo)
      .length,
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) =>
        filter === "verified"
          ? u.email_verified
          : filter === "unverified"
            ? !u.email_verified
            : filter === "active"
              ? !!u.last_active_at && new Date(u.last_active_at).getTime() > weekAgo
              : true,
      )
      .filter(
        (u) =>
          !q ||
          `${u.full_name ?? ""} ${u.email ?? ""} ${u.education ?? ""}`.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const av = a[sort] ?? "";
        const bv = b[sort] ?? "";
        return av < bv ? 1 : av > bv ? -1 : 0;
      });
  }, [users, query, filter, sort, weekAgo]);

  const exportCsv = () => {
    const cols: [string, (u: UserRow) => unknown][] = [
      ["Name", (u) => u.full_name ?? ""],
      ["Email", (u) => u.email ?? ""],
      ["Education", (u) => u.education ?? ""],
      ["Joined", (u) => u.joined_at],
      ["Verified", (u) => (u.email_verified ? "yes" : "no")],
      ["Last active", (u) => u.last_active_at ?? ""],
      ["Assessments", (u) => u.assessments],
      ["Avg assessment %", (u) => u.avg_assessment_score ?? ""],
      ["Interviews", (u) => u.interviews],
      ["Avg interview %", (u) => u.avg_interview_score ?? ""],
      ["DSA levels", (u) => u.dsa_levels_completed],
      ["Problems solved", (u) => u.problems_solved],
      ["Resume reviews", (u) => u.resume_reviews],
      ["Best ATS", (u) => u.best_ats_score ?? ""],
    ];
    const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [
      cols.map(([h]) => esc(h)).join(","),
      ...visible.map((u) => cols.map(([, f]) => esc(f(u))).join(",")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `nexora-users-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or education"
            aria-label="Search users"
            className="h-10 w-full rounded-xl border border-border/70 bg-surface/50 pl-10 pr-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort users"
          className="h-10 rounded-xl border border-border/70 bg-surface/50 px-3 text-sm"
        >
          <option value="joined_at">Newest first</option>
          <option value="last_active_at">Recently active</option>
          <option value="assessments">Most assessments</option>
          <option value="interviews">Most interviews</option>
          <option value="dsa_levels_completed">Most DSA progress</option>
        </select>
        <button
          onClick={exportCsv}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-gold)" }}
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["verified", "Verified"],
            ["unverified", "Unverified"],
            ["active", "Active this week"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              filter === id
                ? "border-primary/60 bg-primary/15 text-foreground"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {label} <span className="ml-1 tabular-nums opacity-70">{counts[id]}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-border/60 bg-surface/30">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="border-b border-border/60 bg-surface/40 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Last active</th>
                <th className="px-4 py-3 text-right font-medium">Assessments</th>
                <th className="px-4 py-3 text-right font-medium">Interviews</th>
                <th className="px-4 py-3 text-right font-medium">DSA</th>
                <th className="px-4 py-3 text-right font-medium">Best ATS</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {visible.map((u) => (
                <tr
                  key={u.user_id}
                  onClick={() => onOpenUser(u)}
                  className="cursor-pointer transition hover:bg-surface/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} />
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {u.full_name || u.email?.split("@")[0]}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {fmtDate(u.joined_at)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {timeAgo(u.last_active_at ?? u.last_sign_in_at)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {u.assessments}
                    {u.avg_assessment_score != null && (
                      <span className="ml-1.5 text-xs" style={{ color: TONES.assess }}>
                        {u.avg_assessment_score}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {u.interviews}
                    {u.avg_interview_score != null && (
                      <span className="ml-1.5 text-xs" style={{ color: TONES.interview }}>
                        {u.avg_interview_score}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {u.dsa_levels_completed}
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {u.problems_solved} solved
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{u.best_ats_score ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {u.is_admin && <Badge tone={TONES.dsa}>Admin</Badge>}
                      {u.email_verified ? (
                        <Badge tone={TONES.resume}>Verified</Badge>
                      ) : (
                        <Badge tone="#9aa4b6">Unverified</Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visible.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No users match.</p>
        )}
      </div>
    </div>
  );
}

/* ============================== user detail =============================== */

function UserSheet({ user: u, onClose }: { user: UserRow | null; onClose: () => void }) {
  const [detail, setDetail] = useState<Detail | null>(null);

  useEffect(() => {
    setDetail(null);
    if (!u) return;
    void supabase
      .rpc("admin_user_detail", { target: u.user_id })
      .then(({ data }) => setDetail(data as unknown as Detail));
  }, [u]);

  return (
    <Sheet open={!!u} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-border/60 bg-background sm:max-w-lg"
      >
        {u && (
          <div>
            <div className="flex items-center gap-4">
              <Avatar user={u} size="lg" />
              <div className="min-w-0">
                <SheetTitle className="truncate text-xl">
                  {u.full_name || u.email?.split("@")[0]}
                </SheetTitle>
                <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {u.is_admin && <Badge tone={TONES.dsa}>Admin</Badge>}
                  {u.email_verified ? (
                    <Badge tone={TONES.resume}>Verified</Badge>
                  ) : (
                    <Badge tone="#9aa4b6">Unverified</Badge>
                  )}
                </div>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <Info label="Joined" value={fmtDate(u.joined_at)} />
              <Info label="Last active" value={timeAgo(u.last_active_at ?? u.last_sign_in_at)} />
              <Info label="Education" value={u.education || "—"} />
              <Info label="Resume built" value={u.has_resume ? "Yes" : "No"} />
            </dl>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniStat
                tone={TONES.assess}
                label="Assessments"
                value={u.assessments}
                sub={u.avg_assessment_score != null ? `avg ${u.avg_assessment_score}%` : undefined}
              />
              <MiniStat
                tone={TONES.interview}
                label="Interviews"
                value={u.interviews}
                sub={u.avg_interview_score != null ? `avg ${u.avg_interview_score}%` : undefined}
              />
              <MiniStat
                tone={TONES.dsa}
                label="DSA levels"
                value={u.dsa_levels_completed}
                sub={`${u.problems_solved} problems solved`}
              />
              <MiniStat
                tone={REVIEW_TONE}
                label="Resume reviews"
                value={u.resume_reviews}
                sub={u.best_ats_score != null ? `best ATS ${u.best_ats_score}` : undefined}
              />
            </div>

            {!detail ? (
              <div className="grid place-items-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <DetailList
                  title="Assessments"
                  tone={TONES.assess}
                  rows={detail.assessments.map((a) => [
                    `${a.technology} · ${cap(a.difficulty)}`,
                    `${a.score}%`,
                    fmtDate(a.at),
                  ])}
                />
                <DetailList
                  title="Mock interviews"
                  tone={TONES.interview}
                  rows={detail.interviews.map((i) => [
                    `${i.type === "hr" ? "HR" : cap(i.type)} · ${cap(i.difficulty)}`,
                    `${i.score}%`,
                    fmtDate(i.at),
                  ])}
                />
                <DetailList
                  title="DSA levels"
                  tone={TONES.dsa}
                  rows={detail.dsa_levels.map((l) => [
                    `${l.topic_id} / ${l.level_id}`,
                    `quiz ${l.quiz_score}%`,
                    l.completed ? "done" : "in progress",
                  ])}
                />
                <DetailList
                  title="Resume reviews"
                  tone={REVIEW_TONE}
                  rows={detail.resume_reviews.map((r) => [
                    r.file_name ?? "resume",
                    `ATS ${r.score}`,
                    fmtDate(r.at),
                  ])}
                />
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* =============================== login =================================== */

// Separate login for /admin: username (or email) + password. Access is
// granted only if the account has the admin role in public.user_roles.
function AdminLogin({ signedInAs }: { signedInAs: string | null }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const id = username.trim().toLowerCase();
    const email = id.includes("@") ? id : `${id}@${ADMIN_EMAIL_DOMAIN}`;
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.code === "invalid_credentials" ? "Wrong username or password." : err.message);
      setBusy(false);
      return;
    }
    const { data: admin } = await supabase.rpc("is_admin");
    if (admin !== true) {
      // Don't leave a non-admin signed in from the admin screen.
      await supabase.auth.signOut();
      setError("This account doesn't have admin access.");
    }
    setBusy(false);
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_60%)]" />
      <div className="w-full max-w-[400px]">
        <div className="flex justify-center">
          <AdminLogo />
        </div>
        <div className="mt-8 rounded-3xl border border-border/70 bg-surface/50 p-7 shadow-card backdrop-blur-xl sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Admin sign in</h1>

          {signedInAs ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                You're signed in as <strong className="text-foreground">{signedInAs}</strong>, which
                isn't an admin account.
              </p>
              <button
                onClick={() => void supabase.auth.signOut()}
                className="mt-6 h-11 w-full rounded-xl text-sm font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-gold)" }}
              >
                Sign out and use the admin account
              </button>
            </>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <p className="-mt-3 text-sm text-muted-foreground">
                Restricted area. Authorised staff only.
              </p>
              <div>
                <label
                  htmlFor="admin-username"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="admin-username"
                    autoComplete="username"
                    autoCapitalize="none"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border/70 bg-background/60 pl-10 pr-3 text-sm focus:border-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="admin-password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border/70 bg-background/60 pl-10 pr-11 text-sm focus:border-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-70"
                style={{ background: "var(--gradient-gold)" }}
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in to admin
              </button>
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            ← Back to Nexora
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ============================== small parts =============================== */

function FullScreenSpinner() {
  return (
    <div className="grid min-h-screen place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

function Card({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-surface/40 p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Kpi({
  icon: Icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  tone: string;
  label: string;
  value: ReactNode;
  sub: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface/40 p-4 md:p-5"
      style={{
        backgroundImage: `radial-gradient(220px 110px at 100% 0%, ${tint(tone, 0.12)}, transparent 70%)`,
      }}
    >
      <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: tone }} />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground md:text-sm">{label}</span>
        <span
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{ background: tint(tone, 0.14), color: tone }}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 truncate text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Avatar({ user, size = "md" }: { user: UserRow; size?: "md" | "lg" }) {
  const tone = avatarTone(user.user_id);
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${size === "lg" ? "h-14 w-14 text-lg" : "h-9 w-9 text-xs"}`}
      style={{ background: tint(tone, 0.16), color: tone }}
    >
      {initials(user)}
    </span>
  );
}

function Badge({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: tint(tone, 0.14), color: tone }}
    >
      {children}
    </span>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-surface/40 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate font-medium">{value}</dd>
    </div>
  );
}

function MiniStat({
  tone,
  label,
  value,
  sub,
}: {
  tone: string;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div
      className="rounded-xl border border-border/50 p-3"
      style={{ background: tint(tone, 0.06) }}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums" style={{ color: tone }}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function DetailList({
  title,
  tone,
  rows,
}: {
  title: string;
  tone: string;
  rows: [string, string, string][];
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-semibold">
        <span className="h-2 w-2 rounded-full" style={{ background: tone }} />
        {title}
        <span className="text-xs font-normal text-muted-foreground">({rows.length})</span>
      </p>
      {rows.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">Nothing yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-border/40 rounded-xl border border-border/50">
          {rows.slice(0, 8).map(([a, b, c], i) => (
            <li key={i} className="flex items-center gap-3 px-3 py-2 text-xs">
              <span className="min-w-0 flex-1 truncate">{a}</span>
              <span className="font-semibold tabular-nums" style={{ color: tone }}>
                {b}
              </span>
              <span className="w-20 text-right text-muted-foreground">{c}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
