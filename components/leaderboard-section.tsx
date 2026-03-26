"use client";

import { useEffect, useState } from "react";

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

export default function LeaderboardSection() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const res = await fetch("/api/leaderboard");
        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || "Kunde inte hämta leaderboard");
          return;
        }

        setEntries(data.leaderboard ?? []);
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
    return fullName || "Namn saknas";
  }

  function toggleEntry(id: string) {
    setOpenEntryId((prev) => (prev === id ? null : id));
  }

  function getPlacementStyle(placement: number) {
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

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black text-slate-900 md:text-2xl">Leaderboard</h2>
        <p className="mt-3 text-sm text-slate-600">Laddar leaderboard...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black text-slate-900 md:text-2xl">Leaderboard</h2>
        <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 md:text-2xl">Leaderboard</h2>
          <p className="mt-1 text-sm text-slate-600">
            Klicka på ett namn för att se poängfördelning och tiebreaker.
          </p>
        </div>

        <div className="inline-flex w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
          {entries.length} deltagare
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="hidden grid-cols-[74px_minmax(0,1fr)_92px] bg-slate-100 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-600 md:grid">
          <div>Plats</div>
          <div>Namn</div>
          <div className="text-right">Poäng</div>
        </div>

        {entries.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500">
            Inga deltagare hittades ännu.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {entries.map((entry) => {
              const isOpen = openEntryId === entry.id;

              return (
                <div key={entry.id} className="bg-white">
                  <button
  type="button"
  onClick={() => toggleEntry(entry.id)}
  className="grid w-full grid-cols-[52px_minmax(0,1fr)_64px] items-center gap-2 px-3 py-2 text-left transition hover:bg-slate-50 md:grid-cols-[60px_minmax(0,1fr)_72px]"
>
                    <div>
                      <div
  className={`inline-flex min-w-[30px] items-center justify-center rounded-full px-2 py-0.5 text-xs font-black ${getPlacementStyle(
    entry.placement
  )}`}
>
                        {entry.placement}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-bold text-slate-900 md:text-base">
                          {formatName(entry)}
                        </div>
                        <span className="text-xs text-slate-400">
                          {isOpen ? "▾" : "▸"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
  <div className="text-lg font-black leading-none text-slate-900 md:text-xl">
    {entry.points}
  </div>
</div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <DetailCard label="Matchpoäng" value={entry.breakdown?.groupMatchPoints ?? 0} />
                        <DetailCard
                          label="Exakt resultat-bonus"
                          value={entry.breakdown?.exactScoreBonusPoints ?? 0}
                        />
                        <DetailCard
                          label="Tabellplacering"
                          value={entry.breakdown?.tablePlacementPoints ?? 0}
                        />
                        <DetailCard label="R32" value={entry.breakdown?.round32Points ?? 0} />
                        <DetailCard label="R16" value={entry.breakdown?.round16Points ?? 0} />
                        <DetailCard
                          label="Kvartsfinal"
                          value={entry.breakdown?.quarterfinalPoints ?? 0}
                        />
                        <DetailCard
                          label="Semifinal"
                          value={entry.breakdown?.semifinalPoints ?? 0}
                        />
                        <DetailCard label="Final" value={entry.breakdown?.finalPoints ?? 0} />
                        <DetailCard
                          label="Bronsmatch"
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
                        <DetailCard label="Total" value={entry.breakdown?.total ?? entry.points} />
                      </div>

                      <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <div className="text-sm font-bold text-slate-900">
                          Tiebreaker: mål i gruppspelet
                        </div>
                        <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                          <div>
                            <span className="font-semibold text-slate-700">Tippade mål:</span>{" "}
                            {entry.predicted_group_goals}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Faktiska mål:</span>{" "}
                            {entry.official_group_goals}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Skillnad:</span>{" "}
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

function DetailCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black leading-none text-slate-900">
        {value}
      </div>
    </div>
  );
}