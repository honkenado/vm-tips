"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import NewsPreview from "@/components/NewsPreview";
import AuthStatus from "@/components/auth-status";
import GlobalChat from "@/components/chat/GlobalChat";

type TabKey = "overview" | "news" | "chat";
type ChartMode = "points" | "rank";

type LeagueSummary = {
  id: string;
  name: string;
  rank: number | null;
  total: number;
  note: string;
  href: string;
};

type LatestPoint = {
  match: string;
  prediction: string;
  points: number;
  note: string;
};

type RankHistoryItem = {
  date: string;
  rank: number;
  points: number;
};

type TodayMatchCard = {
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  groupName: string;
  tvChannel: string | null;
  userTip: string | null;
  peopleTip: string | null;
  sameTipPercent: number | null;
  isCompleted?: boolean;
  result?: string | null;
  userPoints?: number | null;
  isOpen?: boolean;
  outcomeDistribution: {
    home: number;
    draw: number;
    away: number;
  } | null;
};

type DashboardResponse = {
  user: {
    id: string;
    displayName: string;
    isLoggedIn: boolean;
    isAdmin: boolean;
  };
  hero: {
    totalPoints: number;
    totalParticipants: number;
    leaderPoints: number;
    pointsToLeader: number | null;
    pointsToTop10: number | null;
    chosenGoldenBoot: string;
    latestUpdate: LatestPoint | null;
    leagueSummaries: LeagueSummary[];
  };
  rankHistory: RankHistoryItem[];
  latestPoints: LatestPoint[];
  todayMatches: TodayMatchCard[];
  nextMatch: TodayMatchCard | null;
  error?: string;
};

function MiniLineChart({
  values,
  labels,
  maxRank,
  inverted = false,
}: {
  values: number[];
  labels: string[];
  maxRank?: number;
  inverted?: boolean;
}) {
  const safeValues =
    values.length > 1
      ? values
      : values.length === 1
        ? [values[0], values[0]]
        : [0, 0];

  const safeLabels =
    labels.length > 1
      ? labels
      : labels.length === 1
        ? [labels[0], labels[0]]
        : ["Start", "Idag"];

  const width = 900;
  const height = 260;
  const padding = 52;

  const axisMin = inverted ? 1 : 0;
  const axisMax = inverted
    ? Math.max(50, Math.ceil((maxRank ?? Math.max(...safeValues, 1)) / 50) * 50)
    : Math.max(10, Math.ceil(Math.max(...safeValues, 10) / 10) * 10);

  const range = axisMax - axisMin || 1;

  const points = safeValues.map((value, index) => {
    const x = padding + (index / (safeValues.length - 1)) * (width - padding * 2);
    const normalized = (value - axisMin) / range;

    const y = inverted
      ? padding + normalized * (height - padding * 2)
      : height - padding - normalized * (height - padding * 2);

    return { x, y, value };
  });

  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${points[0].x},${height - padding} ${line} ${points[points.length - 1].x},${height - padding}`;

  const axisLabels = inverted
    ? [1, Math.round(axisMax * 0.25), Math.round(axisMax * 0.5), Math.round(axisMax * 0.75), axisMax]
    : [0, Math.round(axisMax * 0.25), Math.round(axisMax * 0.5), Math.round(axisMax * 0.75), axisMax];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full sm:h-64">
      <polygon points={area} className="fill-emerald-400/10" />

      {axisLabels.map((label) => {
        const normalized = (label - axisMin) / range;

        const y = inverted
          ? padding + normalized * (height - padding * 2)
          : height - padding - normalized * (height - padding * 2);

        return (
          <g key={label}>
            <line
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              className="stroke-white/10"
              strokeWidth="1"
            />
            <text
              x={padding - 12}
              y={y + 5}
              textAnchor="end"
              className="fill-white/35 text-[14px] font-bold"
            >
              {label}
            </text>
          </g>
        );
      })}

      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-emerald-400"
      />

      {points.map((point, index) => (
        <g key={index}>
          <circle cx={point.x} cy={point.y} r="7" className="fill-emerald-300" />
          <text
            x={point.x}
            y={point.y - 16}
            textAnchor="middle"
            className="fill-white text-[20px] font-black"
          >
            {point.value}
          </text>
          <text
            x={point.x}
            y={height - 4}
            textAnchor="middle"
            className="fill-white/45 text-[16px] font-bold"
          >
            {safeLabels[index]}
          </text>
        </g>
      ))}
    </svg>
  );
}

function MobileTabs({
  activeTab,
  setActiveTab,
  hasUnreadNews,
  markNewsAsRead,
}: {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  hasUnreadNews: boolean;
  markNewsAsRead: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 -mx-4 mb-5 border-b border-white/10 bg-[#020617]/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="grid grid-cols-3 gap-2 rounded-full border border-white/10 bg-black/20 p-1">
        {[
  ["overview", "Översikt"],
  ["news", "Nyheter"],
  ["chat", "Chatt"],
].map(([value, label]) => (
  <button
  key={value}
  type="button"
  onClick={() => {
    setActiveTab(value as TabKey);

    if (value === "news") {
      markNewsAsRead();
    }
  }}
  className={`relative rounded-full px-3 py-2 text-sm font-black ${
    activeTab === value ? "bg-emerald-500 text-white" : "text-white/55"
  }`}
>
  <span className="inline-flex items-center justify-center gap-2">
    {label}

    {value === "news" && hasUnreadNews ? (
      <span className="rounded-full bg-emerald-300 px-2 py-0.5 text-[10px] font-black text-black shadow-[0_0_14px_rgba(110,231,183,0.9)]">
        NY
      </span>
    ) : null}
  </span>
</button>
))}
      </div>
    </div>
  );
}

function formatLeagueRank(league: LeagueSummary) {
  if (!league.rank || league.total <= 0) return "—";
  return `${league.rank} / ${league.total}`;
}
function TrendBadge({ value = 0 }: { value?: number | null }) {
  if (value == null || value === 0) {
    return (
      <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-black text-white/45">
        →
      </span>
    );
  }

  if (value > 0) {
    return (
      <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-black text-emerald-300">
        ↑ {value}
      </span>
    );
  }

  return (
    <span className="rounded-full border border-red-300/20 bg-red-400/10 px-2.5 py-1 text-xs font-black text-red-300">
      ↓ {Math.abs(value)}
    </span>
  );
}

export default function PostDeadlineDashboard({
  displayName,
  paymentCode,
  isPaid,
  isAdmin,
}: {
  displayName: string;
  paymentCode: string | null;
  isPaid: boolean;
  isAdmin: boolean;
}) {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<ChartMode>("rank");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [hasUnreadNews, setHasUnreadNews] = useState(false);

useEffect(() => {
  const hasSeenNews = window.localStorage.getItem("vm-news-seen") === "true";
  setHasUnreadNews(!hasSeenNews);
}, []);

function markNewsAsRead() {
  window.localStorage.setItem("vm-news-seen", "true");
  setHasUnreadNews(false);
}

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const res = await fetch("/api/post-deadline-dashboard", { cache: "no-store" });
        const json = (await res.json()) as DashboardResponse;

        if (!res.ok) {
          throw new Error(json.error || "Kunde inte hämta dashboarddata");
        }

        if (isMounted) {
          setDashboard(json);
        }
      } catch (error) {
        console.error("Kunde inte hämta dashboarddata", error);
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Okänt fel");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const rankValues = useMemo(
    () => (dashboard?.rankHistory ?? []).map((item) => item.rank),
    [dashboard]
  );

  const pointValues = useMemo(
    () => (dashboard?.rankHistory ?? []).map((item) => item.points),
    [dashboard]
  );

  const chartLabels = useMemo(
    () => (dashboard?.rankHistory ?? []).map((item) => item.date),
    [dashboard]
  );
  const hasRealRankHistory = (dashboard?.rankHistory ?? []).length > 0;

  const mainLeague = dashboard?.hero.leagueSummaries[0] ?? null;
  const miniLeagues = dashboard?.hero.leagueSummaries.slice(1, 3) ?? [];
  const leagueCards =
  dashboard?.hero.leagueSummaries.filter(
    (league) => league.id !== mainLeague?.id
  ) ?? [];
  const latestUpdate = dashboard?.hero.latestUpdate ?? null;
  const nextMatch = dashboard?.nextMatch ?? null;
  const todayMatches = dashboard?.todayMatches ?? [];
  console.log("todayMatches", todayMatches);
  const defaultOpenMatchNumber =
    todayMatches.find((match) => !match.isCompleted)?.matchNumber ??
    todayMatches[0]?.matchNumber ??
    null;
  const totalParticipants = dashboard?.hero.totalParticipants ?? 0;

  const overviewContent = dashboard ? (
    <div className="space-y-5">
      
<section className="overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.99))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.65)] lg:p-6">
  <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr] xl:items-stretch">
    <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
        Mitt VM
      </p>

      <h1 className="mt-2 truncate text-2xl font-black text-white sm:text-3xl">
        {dashboard.user.displayName}
      </h1>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
  href="/league"
  className="rounded-[1.3rem] border border-white/10 bg-white/[0.05] p-4 transition hover:bg-white/[0.08]"
>
  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
    Placering
  </p>

  <p className="mt-2 text-3xl font-black text-white">
    {mainLeague?.rank && mainLeague?.total
      ? `${mainLeague.rank} / ${mainLeague.total}`
      : "—"}
  </p>

  <p className="mt-1 text-xs font-bold text-emerald-300">
    Visa huvudligan →
  </p>
</Link>

        <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.05] p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
            Poäng
          </p>
          <p className="mt-2 text-3xl font-black text-emerald-300">
            {dashboard.hero.totalPoints}p
          </p>
          <p className="mt-1 text-xs font-bold text-white/45">
            totalt just nu
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
            Till topp 10
          </p>
          <p className="mt-2 text-2xl font-black">
            {dashboard.hero.pointsToTop10 == null ? "—" : `${dashboard.hero.pointsToTop10}p`}
          </p>
        </div>

        <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
            Till ledaren
          </p>
          <p className="mt-2 text-2xl font-black">
            {dashboard.hero.pointsToLeader == null ? "—" : `${dashboard.hero.pointsToLeader}p`}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-black/25 p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
          Senaste poäng
        </p>

        {latestUpdate ? (
          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-lg font-black">{latestUpdate.match}</p>
              <p className="text-xs font-semibold text-white/55">
                Ditt tips: {latestUpdate.prediction}
              </p>
            </div>
            <p className="shrink-0 text-3xl font-black text-emerald-300">
              +{latestUpdate.points}p
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm font-semibold text-white/65">
            Inga poänggivande matcher ännu.
          </p>
        )}
      </div>
    </div>

    <div className="rounded-[1.6rem] border border-emerald-300/15 bg-emerald-400/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">
            Mina ligor
          </p>
          <h2 className="mt-1 text-xl font-black text-white">
            Placeringar
          </h2>
        </div>

        
      </div>

      <div className="mt-4 overflow-hidden rounded-[1.3rem] border border-white/10 bg-black/15">
        {leagueCards.length > 0 ? (
  leagueCards.map((league, index) => (
            <Link
              key={league.id}
              href={league.href}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition hover:bg-white/[0.05] ${
                index > 0 ? "border-t border-white/10" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">
                  {league.name}
                </p>
                <p className="mt-0.5 truncate text-xs font-semibold text-white/45">
                  {league.note}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-black text-white">
  {league.rank ? `${league.rank} / ${league.total}` : "—"}
</p>
              </div>

              
            </Link>
          ))
        ) : (
          <div className="p-4 text-sm font-semibold text-white/65">
            Ingen ligaplacering hittades ännu.
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.05] p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
            Skyttekung
          </p>
          <p className="mt-2 truncate text-lg font-black text-emerald-300">
            {dashboard.hero.chosenGoldenBoot}
          </p>
        </div>

        <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.05] p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
            VM-läget
          </p>
          <p className="mt-2 text-lg font-black">
            {totalParticipants} deltagare
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/mitt-resultat"
          className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white hover:bg-emerald-400"
        >
          Visa mitt resultat
        </Link>

        <Link
          href="/tips"
          className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white/85 hover:bg-white/[0.1]"
        >
          Visa mina tips
        </Link>
      </div>
    </div>
  </div>
</section>
      

      <section className="rounded-[2.25rem] border border-white/10 bg-white/[0.04] p-5 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-3xl font-black">{chartMode === "rank" ? "Placering över tid" : "Poängutveckling"}</h2>
            <p className="mt-1 text-sm font-semibold text-white/55">
              {hasRealRankHistory
  ? "Följ hur du klättrar eller tappar placering under turneringen."
  : "Historiken visas här när de första poängen har delats ut."}
            </p>
          </div>

          <div className="flex rounded-full border border-white/10 bg-black/20 p-1">
            <button type="button" onClick={() => setChartMode("rank")} className={`rounded-full px-4 py-2 text-sm font-black ${chartMode === "rank" ? "bg-emerald-500 text-white" : "text-white/55 hover:text-white"}`}>
              Placering
            </button>

            <button type="button" onClick={() => setChartMode("points")} className={`rounded-full px-4 py-2 text-sm font-black ${chartMode === "points" ? "bg-emerald-500 text-white" : "text-white/55 hover:text-white"}`}>
              Poäng
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
  {hasRealRankHistory ? (
    <MiniLineChart
      values={chartMode === "rank" ? rankValues : pointValues}
      labels={chartLabels}
      maxRank={totalParticipants}
      inverted={chartMode === "rank"}
    />
  ) : (
    <div className="flex min-h-[210px] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-400/10 text-2xl">
        📈
      </div>

      <h3 className="mt-4 text-xl font-black text-white">
        Rankhistorik startar snart
      </h3>

      <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-white/55">
        När de första poänggivande matcherna är registrerade visas din
        placering och poängutveckling här.
      </p>
    </div>
  )}
</div>

        
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">Kommande matcher</h2>
            <p className="mt-1 text-sm font-semibold text-white/55">
              Dagens matcher, dina tips och folkets vanligaste resultat.
            </p>
          </div>

          <Link
            href="/tv-guide"
            className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-200"
          >
            TV-guide
          </Link>
        </div>

        {todayMatches.length > 0 ? (
          <div className="mt-5 space-y-3">
            {todayMatches.map((match) => {
              const outcomeDistribution = match.outcomeDistribution;

              return (
                <details
  key={match.matchNumber}
  open={match.matchNumber === defaultOpenMatchNumber}
  className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/25"
>
                  <summary className="cursor-pointer list-none px-4 py-4 transition hover:bg-white/[0.04]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {match.isCompleted ? (
                            <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-black text-emerald-200">
                              Klar
                            </span>
                          ) : (
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-black text-white/60">
                              {match.time}
                            </span>
                          )}

                          <span className="text-xs font-bold text-white/45">
                            {match.groupName}
                          </span>
                        </div>

                        <p className="mt-2 truncate text-lg font-black text-white">
                          {match.homeTeam}
                          {match.isCompleted && match.result ? ` ${match.result} ` : " – "}
                          {match.awayTeam}
                        </p>
                      </div>

                      {match.isCompleted ? (
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">
                            Dina poäng
                          </p>
                          <p className="text-2xl font-black text-emerald-300">
                            +{match.userPoints ?? 0}
                          </p>
                        </div>
                      ) : (
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">
                            Start
                          </p>
                          <p className="text-xl font-black text-white">
                            {match.time}
                          </p>
                        </div>
                      )}
                    </div>
                  </summary>

                  <div className="border-t border-white/10 px-4 pb-4 pt-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-white/45">
                          Ditt tips
                        </p>
                        <p className="mt-2 text-3xl font-black text-emerald-300">
                          {match.userTip ?? "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-white/45">
                          Vanligaste resultat
                        </p>
                        <p className="mt-2 text-3xl font-black">
                          {match.peopleTip ?? "—"}
                        </p>
                      </div>

                      <Link
                        href="/tv-guide"
                        className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-center transition hover:bg-white/[0.08]"
                      >
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-white/45">
                          TV
                        </p>

                        <p className="mt-2 text-2xl font-black">
                          {match.tvChannel ?? "TV-guide"}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-emerald-300">
                          Visa guide →
                        </p>
                      </Link>
                    </div>

                    {outcomeDistribution ? (
                      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                        <h3 className="font-black">Utfallsfördelning</h3>

                        {[
                          [match.homeTeam, outcomeDistribution.home],
                          ["Kryss", outcomeDistribution.draw],
                          [match.awayTeam, outcomeDistribution.away],
                        ].map(([label, percent]) => (
                          <div key={label} className="mt-3">
                            <div className="mb-1 flex justify-between text-xs font-bold text-white/60">
                              <span>{label}</span>
                              <span>{percent}%</span>
                            </div>

                            <div className="h-2 rounded-full bg-white/10">
                              <div
                                className="h-2 rounded-full bg-emerald-400"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </details>
              );
            })}
          </div>
        ) : nextMatch ? (
          <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-black/25 p-5 text-sm font-semibold text-white/65">
            Ingen match hittades för dagen.
          </div>
        ) : (
          <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-black/25 p-5 text-sm font-semibold text-white/65">
            Ingen kommande match hittades.
          </div>
        )}
      </section>
    </div>
  ) : null;

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 text-white">
      <div className="mx-auto max-w-[1500px]">
        

        {loading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">Laddar din vy...</div>
        ) : errorMessage ? (
          <div className="rounded-[2rem] border border-red-400/20 bg-red-500/10 p-6 text-red-100">
            {errorMessage}
          </div>
        ) : dashboard ? (
          <>
            <MobileTabs
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  hasUnreadNews={hasUnreadNews}
  markNewsAsRead={markNewsAsRead}
/>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
  <div className={activeTab === "overview" ? "block" : "hidden lg:block"}>
    {overviewContent}
  </div>

  <aside className="hidden xl:block">
  <div className="sticky top-5 space-y-5">
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4 text-white shadow-[0_18px_55px_rgba(0,0,0,0.38)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300">
            Konto
          </p>
          <p className="mt-1 text-lg font-black text-white">{displayName}</p>
        </div>

        {isAdmin ? (
          <Link
            href="/admin"
            className="rounded-full border border-emerald-400/25 bg-emerald-500/12 px-3 py-1.5 text-xs font-black text-emerald-100"
          >
            Admin
          </Link>
        ) : null}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {paymentCode ? (
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm font-black text-white/90">
            {paymentCode}
          </span>
        ) : null}

        <span
          className={`rounded-full px-3 py-1.5 text-sm font-black ${
            isPaid
              ? "border border-emerald-400/20 bg-emerald-500/12 text-emerald-100"
              : "border border-amber-400/20 bg-amber-500/12 text-amber-100"
          }`}
        >
          {isPaid ? "Betald" : "Ej betald"}
        </span>
      </div>

      <details>
        <summary className="cursor-pointer list-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-bold text-white/80">
          Konto & betalning
        </summary>

        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
          <AuthStatus />
        </div>
      </details>
    </div>

    <GlobalChat
        isLoggedIn={dashboard.user.isLoggedIn}
        isAdmin={dashboard.user.isAdmin}
        currentUserId={dashboard.user.id}
      />
    </div>
  </aside>

  <div className={activeTab === "news" ? "block lg:hidden" : "hidden"}>
    <NewsPreview />
  </div>

  <div className={activeTab === "chat" ? "block lg:hidden" : "hidden"}>
    <GlobalChat
      isLoggedIn={dashboard.user.isLoggedIn}
      isAdmin={dashboard.user.isAdmin}
      currentUserId={dashboard.user.id}
    />
  </div>
</div>

<div className="mt-5 hidden lg:block">
  <NewsPreview />
</div>
          </>
        ) : null}
      </div>
    </main>
  );
}
