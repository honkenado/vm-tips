"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type League = {
  id: string;
  name: string;
  join_code: string;
  created_by: string;
  created_at: string;
};

type LeagueMember = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  payment_status: "paid" | "unpaid" | null;
  joined_at: string | null;
};

type GlobalLeaderboardEntry = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  placement: number;
  points: number;
  predicted_group_goals: number;
  official_group_goals: number;
  group_goals_diff: number;
};

type LeagueTableEntry = {
  id: string;
  name: string;
  payment_status: "paid" | "unpaid" | null;
  points: number;
  globalPlacement: number | null;
  joined_at: string | null;
};

export default function LeaguePage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<League | null>(null);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<
    GlobalLeaderboardEntry[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaguePage() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const [leagueRes, leaderboardRes] = await Promise.all([
          fetch(`/api/leagues/${leagueId}`),
          fetch("/api/leaderboard"),
        ]);

        const leagueData = await leagueRes.json();
        const leaderboardData = await leaderboardRes.json();

        if (!leagueRes.ok) {
          setErrorMessage(leagueData.error || "Kunde inte hämta ligan");
          return;
        }

        setLeague(leagueData.league ?? null);
        setMembers(leagueData.members ?? []);

        if (leaderboardRes.ok) {
          setGlobalLeaderboard(leaderboardData.leaderboard ?? []);
        } else {
          setGlobalLeaderboard([]);
        }
      } catch (error) {
        console.error("Fel vid hämtning av liga", error);
        setErrorMessage("Kunde inte hämta ligan");
      } finally {
        setLoading(false);
      }
    }

    if (leagueId) {
      loadLeaguePage();
    }
  }, [leagueId]);

  function formatName(member: LeagueMember) {
    const fullName = `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim();
    return fullName || member.username || "Namn saknas";
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

  const table = useMemo(() => {
    const globalMap = new Map(globalLeaderboard.map((entry) => [entry.id, entry]));

    const entries: LeagueTableEntry[] = members.map((member) => {
      const globalEntry = globalMap.get(member.id);
      const isPaid = member.payment_status === "paid";

      return {
        id: member.id,
        name: formatName(member),
        payment_status: member.payment_status,
        points: isPaid ? globalEntry?.points ?? 0 : 0,
        globalPlacement: isPaid ? globalEntry?.placement ?? null : null,
        joined_at: member.joined_at,
      };
    });

    entries.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;

      const aPaid = a.payment_status === "paid" ? 1 : 0;
      const bPaid = b.payment_status === "paid" ? 1 : 0;

      if (bPaid !== aPaid) return bPaid - aPaid;

      return a.name.localeCompare(b.name, "sv");
    });

    return entries;
  }, [members, globalLeaderboard]);

  const paidCount = table.filter((entry) => entry.payment_status === "paid").length;
  const unpaidCount = table.filter((entry) => entry.payment_status !== "paid").length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eef2ff_28%,_#f8fafc_58%,_#e2e8f0_100%)] px-3 py-4 sm:px-4 md:px-6 md:py-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:p-6">
            <p className="text-sm text-slate-600">Laddar liga...</p>
          </div>
        </div>
      </main>
    );
  }

  if (errorMessage || !league) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eef2ff_28%,_#f8fafc_58%,_#e2e8f0_100%)] px-3 py-4 sm:px-4 md:px-6 md:py-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[1.5rem] border border-red-200 bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:p-6">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mb-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Tillbaka
            </button>

            <p className="text-sm text-red-600">
              {errorMessage || "Liga hittades inte"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eef2ff_28%,_#f8fafc_58%,_#e2e8f0_100%)] px-3 py-4 sm:px-4 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="mb-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Tillbaka
              </button>

              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {league.name}
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                Ligakod: <span className="font-bold">{league.join_code}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                {table.length} medlemmar
              </div>
              <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                {paidCount} aktiva
              </div>
              {unpaidCount > 0 && (
                <div className="inline-flex rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                  {unpaidCount} ej betalda
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[1.75rem] sm:p-4 md:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-black text-slate-900 sm:text-xl">
              Liga-tabell
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Ej betalande medlemmar visas med 0 poäng tills betalningen är registrerad.
            </p>
          </div>

          {table.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Det finns inga medlemmar i ligan ännu.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[52px_minmax(0,1fr)_70px] gap-2 bg-slate-100 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-600 sm:grid-cols-[56px_minmax(0,1fr)_90px_110px]">
                <div>Plats</div>
                <div>Namn</div>
                <div className="text-right">Poäng</div>
                <div className="hidden text-right sm:block">Status</div>
              </div>

              <div className="divide-y divide-slate-200">
                {table.map((entry, index) => {
                  const placement = index + 1;
                  const isPaid = entry.payment_status === "paid";

                  return (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-[52px_minmax(0,1fr)_70px] items-center gap-2 px-3 py-3 sm:grid-cols-[56px_minmax(0,1fr)_90px_110px] ${
                        placement === 1
                          ? "bg-amber-50"
                          : placement === 2
                          ? "bg-slate-100"
                          : placement === 3
                          ? "bg-orange-50"
                          : index % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50"
                      }`}
                    >
                      <div>
                        <div
                          className={`inline-flex min-w-[30px] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-black ${getPlacementStyle(
                            placement
                          )}`}
                        >
                          {placement}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-slate-900 sm:text-[15px]">
                          {entry.name}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-2 sm:hidden">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              isPaid
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {isPaid ? "Aktiv" : "Ej betald"}
                          </span>

                          {entry.globalPlacement && (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                              Globalt #{entry.globalPlacement}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="tabular-nums text-lg font-black leading-none text-slate-900">
                          {entry.points}
                        </div>
                      </div>

                      <div className="hidden justify-end sm:flex">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {isPaid ? "Aktiv" : "Ej betald"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}