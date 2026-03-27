"use client";

import { useEffect, useMemo, useState } from "react";

type ScoreBreakdown = {
  groupMatchPoints: number;
  exactScoreBonusPoints: number;
  tablePlacementPoints: number;
  round32Points: number;
  round16Points: number;
  quarterfinalPoints: number;
  semifinalPoints: number;
  finalPoints: number;
  bronzeMatchPoints: number;
  winnerBonusPoints: number;
  goldenBootPoints: number;
  total: number;
};

type LeaderboardEntry = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  has_prediction: boolean;
  updated_at: string | null;
  placement: number;
  points: number;
  predicted_group_goals: number;
  official_group_goals: number;
  group_goals_diff: number;
  breakdown: ScoreBreakdown | null;
};

type LeaderboardResponse = {
  leaderboard?: LeaderboardEntry[];
  currentUserId?: string | null;
  error?: string;
};

export default function LeaderboardSection() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const res = await fetch("/api/leaderboard", {
          cache: "no-store",
        });

        const data: LeaderboardResponse = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || "Kunde inte hämta leaderboard");
          return;
        }

        setEntries(data.leaderboard ?? []);
        setCurrentUserId(data.currentUserId ?? null);
      } catch (error) {
        console.error("Fel vid hämtning av leaderboard", error);
        setErrorMessage("Kunde inte hämta leaderboard");
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  function formatName(entry: LeaderboardEntry) {
    const fullName = `${entry.first_name ?? ""} ${entry.last_name ?? ""}`.trim();
    return fullName || entry.username || "Namn saknas";
  }

  function toggleEntry(id: string) {
    setOpenEntryId((prev) => (prev === id ? null : id));
  }

  function getPlacementStyle(placement: number, isCurrentUser: boolean) {
    if (isCurrentUser) {
      return "bg-emerald-600 text-white ring-1 ring-emerald-500 shadow-md shadow-emerald-200";
    }

    if (placement === 1) {
      return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
    }

    if (placement === 2) {
      return "bg-slate-200 text-slate-700 ring-1 ring-slate-300";
    }

    if (placement === 3) {
      return "bg-orange-100 text-orange-700 ring-1 ring-orange-200";
    }

    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }

  function getRowBackgroundClass(
    index: number,
    placement: number,
    isCurrentUser: boolean
  ) {
    if (isCurrentUser) {
      return "bg-emerald-50";
    }

    if (placement === 1) return "bg-amber-50";
    if (placement === 2) return "bg-slate-100";
    if (placement === 3) return "bg-orange-50";

    return index % 2 === 0 ? "bg-white" : "bg-slate-50";
  }

  const currentUserEntry = useMemo(() => {
    if (!currentUserId) return null;
    return entries.find((entry) => entry.id === currentUserId) ?? null;
  }, [entries, currentUserId]);

  const shouldShowStickyUserCard =
    !!currentUserEntry && currentUserEntry.placement > 3;

  if (loading) {
    return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[1.75rem] sm:p-4 md:p-6">
        <h2 className="text-lg font-black text-slate-900 sm:text-xl md:text-2xl">
          Leaderboard
        </h2>
        <p className="mt-2 text-sm text-slate-600">Laddar leaderboard...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-3 shadow-sm sm:rounded-[1.75rem] sm:p-4 md:p-6">
        <h2 className="text-lg font-black text-slate-900 sm:text-xl md:text-2xl">
          Leaderboard
        </h2>
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[1.75rem] sm:p-4 md:p-6">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 sm:text-xl md:text-2xl">
            Leaderboard
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            Klicka på ett namn för att se poängfördelning och tiebreaker.
          </p>
        </div>

        <div className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
          {entries.length} deltagare
        </div>
      </div>

      {shouldShowStickyUserCard && currentUserEntry && (
        <div className="sticky top-3 z-20 mb-3 rounded-2xl border border-emerald-200 bg-emerald-50/95 p-3 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-flex rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
                  Du
                </span>
                <span className="text-xs font-bold text-emerald-800">
                  Din placering just nu
                </span>
              </div>

              <div className="truncate text-sm font-bold text-slate-900">
                #{currentUserEntry.placement} · {formatName(currentUserEntry)}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                  Poäng
                </div>
                <div className="tabular-nums text-lg font-black text-slate-900">
                  {currentUserEntry.points}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                  Tiebreak
                </div>
                <div className="tabular-nums text-lg font-black text-slate-900">
                  {currentUserEntry.group_goals_diff}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white sm:rounded-2xl">
        <div className="hidden grid-cols-[56px_minmax(0,1fr)_68px] bg-slate-100 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-600 md:grid">
          <div>Plats</div>
          <div>Namn</div>
          <div className="text-right">Poäng</div>
        </div>

        {entries.length === 0 ? (
          <div className="px-4 py-5 text-sm text-slate-500">
            Inga deltagare hittades ännu.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {entries.map((entry, index) => {
              const isOpen = openEntryId === entry.id;
              const isCurrentUser = currentUserId === entry.id;
              const rowBackgroundClass = getRowBackgroundClass(
                index,
                entry.placement,
                isCurrentUser
              );

              return (
                <div
                  key={entry.id}
                  className={`${rowBackgroundClass} ${
                    isCurrentUser
                      ? "relative z-10 ring-1 ring-emerald-200"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleEntry(entry.id)}
                    className={`grid w-full grid-cols-[44px_minmax(0,1fr)_52px] items-center gap-2 px-3 py-2 text-left transition sm:grid-cols-[48px_minmax(0,1fr)_56px] md:grid-cols-[56px_minmax(0,1fr)_68px] ${
                      isCurrentUser
                        ? "hover:bg-emerald-100/80"
                        : "hover:bg-slate-100"
                    } ${isOpen ? (isCurrentUser ? "bg-emerald-100/70" : "bg-slate-100/70") : ""}`}
                  >
                    <div>
                      <div
                        className={`inline-flex min-w-[28px] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-black ${getPlacementStyle(
                          entry.placement,
                          isCurrentUser
                        )}`}
                      >
                        {entry.placement}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`truncate text-sm font-bold leading-tight sm:text-[15px] ${
                            isCurrentUser ? "text-emerald-900" : "text-slate-900"
                          }`}
                        >
                          {formatName(entry)}
                        </div>

                        {isCurrentUser && (
                          <span className="shrink-0 rounded-full border border-emerald-300 bg-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
                            Du
                          </span>
                        )}

                        <span
                          className={`shrink-0 text-[11px] ${
                            isCurrentUser ? "text-emerald-500" : "text-slate-400"
                          }`}
                        >
                          {isOpen ? "▾" : "▸"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`tabular-nums text-base font-black leading-none md:text-lg ${
                          isCurrentUser ? "text-emerald-800" : "text-slate-900"
                        }`}
                      >
                        {entry.points}
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      className={`border-t px-3 py-3 ${
                        isCurrentUser
                          ? "border-emerald-200 bg-emerald-50/60"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                        <DetailCard
                          label="Matchpoäng"
                          value={entry.breakdown?.groupMatchPoints ?? 0}
                        />
                        <DetailCard
                          label="Exakt resultat"
                          value={entry.breakdown?.exactScoreBonusPoints ?? 0}
                        />
                        <DetailCard
                          label="Tabell"
                          value={entry.breakdown?.tablePlacementPoints ?? 0}
                        />
                        <DetailCard
                          label="R32"
                          value={entry.breakdown?.round32Points ?? 0}
                        />
                        <DetailCard
                          label="R16"
                          value={entry.breakdown?.round16Points ?? 0}
                        />
                        <DetailCard
                          label="Kvarts"
                          value={entry.breakdown?.quarterfinalPoints ?? 0}
                        />
                        <DetailCard
                          label="Semi"
                          value={entry.breakdown?.semifinalPoints ?? 0}
                        />
                        <DetailCard
                          label="Final"
                          value={entry.breakdown?.finalPoints ?? 0}
                        />
                        <DetailCard
                          label="Brons"
                          value={entry.breakdown?.bronzeMatchPoints ?? 0}
                        />
                        <DetailCard
                          label="Världsmästare"
                          value={entry.breakdown?.winnerBonusPoints ?? 0}
                        />
                        <DetailCard
                          label="Skyttekung"
                          value={entry.breakdown?.goldenBootPoints ?? 0}
                        />
                        <DetailCard
                          label="Total"
                          value={entry.breakdown?.total ?? entry.points}
                          highlight
                        />
                      </div>

                      <div
                        className={`mt-3 rounded-xl border px-3 py-3 ${
                          isCurrentUser
                            ? "border-emerald-200 bg-white"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900">
                          Tiebreaker: mål i gruppspelet
                        </div>

                        <div className="mt-2 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
                          <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                            <span className="font-semibold text-slate-700">
                              Tippade:
                            </span>{" "}
                            {entry.predicted_group_goals}
                          </div>
                          <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                            <span className="font-semibold text-slate-700">
                              Faktiska:
                            </span>{" "}
                            {entry.official_group_goals}
                          </div>
                          <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                            <span className="font-semibold text-slate-700">
                              Skillnad:
                            </span>{" "}
                            {entry.group_goals_diff}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        highlight
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`text-[10px] font-extrabold uppercase tracking-wide ${
          highlight ? "text-white/75" : "text-slate-500"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-0.5 tabular-nums text-lg font-black leading-none ${
          highlight ? "text-white" : "text-slate-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}