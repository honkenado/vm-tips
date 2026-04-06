"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type League = {
  id: string;
  name: string;
  join_code: string;
  created_by: string | null;
  created_at: string | null;
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
  const [isMainLeague, setIsMainLeague] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaguePage() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const [leagueRes, leaderboardRes] = await Promise.all([
          fetch(`/api/leagues/${leagueId}`, { cache: "no-store" }),
          fetch("/api/leaderboard", { cache: "no-store" }),
        ]);

        const leagueData = await leagueRes.json();
        const leaderboardData = await leaderboardRes.json();

        if (!leagueRes.ok) {
          setErrorMessage(leagueData.error || "Kunde inte hämta ligan");
          return;
        }

        setLeague(leagueData.league ?? null);
        setMembers(leagueData.members ?? []);
        setIsMainLeague(Boolean(leagueData.isMainLeague));

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
      return "border-amber-400/25 bg-amber-500/14 text-amber-100";
    }

    if (placement === 2) {
      return "border-slate-300/20 bg-white/10 text-slate-100";
    }

    if (placement === 3) {
      return "border-orange-400/20 bg-orange-500/14 text-orange-100";
    }

    return "border-white/10 bg-white/[0.05] text-white/85";
  }

  const table = useMemo(() => {
    if (isMainLeague) {
      return globalLeaderboard.map((entry) => ({
        id: entry.id,
        name:
          `${entry.first_name ?? ""} ${entry.last_name ?? ""}`.trim() ||
          entry.username ||
          "Namn saknas",
        payment_status: "paid" as const,
        points: entry.points,
        globalPlacement: entry.placement,
        joined_at: null,
      }));
    }

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
  }, [members, globalLeaderboard, isMainLeague]);

  const paidCount = table.filter((entry) => entry.payment_status === "paid").length;
  const unpaidCount = table.filter((entry) => entry.payment_status !== "paid").length;

  if (loading) {
    return (
      <main className="min-h-screen px-3 py-4 sm:px-4 md:px-6 md:py-8">
        <div className="mx-auto max-w-5xl">
          <div className="card-premium-strong p-5 sm:p-6">
            <p className="text-sm text-white/70">Laddar liga...</p>
          </div>
        </div>
      </main>
    );
  }

  if (errorMessage || !league) {
    return (
      <main className="min-h-screen px-3 py-4 sm:px-4 md:px-6 md:py-8">
        <div className="mx-auto max-w-5xl">
          <div className="card-premium-strong border border-red-400/20 bg-red-500/10 p-5 sm:p-6">
            <button
              type="button"
              onClick={() => router.push("/league")}
              className="btn-secondary-premium mb-4 px-4 py-2 text-sm"
            >
              Tillbaka
            </button>

            <p className="text-sm text-red-200">
              {errorMessage || "Liga hittades inte"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-3 py-4 sm:px-4 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl">
        <section className="card-premium-strong mb-4 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => router.push("/league")}
                className="btn-secondary-premium mb-4 px-4 py-2 text-sm"
              >
                Tillbaka
              </button>

              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                {league.name}
              </h1>

              <p className="text-muted-premium mt-2 text-sm">
                Ligakod: <span className="font-bold text-white">{league.join_code}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/85 backdrop-blur-xl">
                {table.length} medlemmar
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-3 py-1.5 text-xs font-bold text-emerald-100 backdrop-blur-xl">
                {paidCount} aktiva
              </div>
              {!isMainLeague && unpaidCount > 0 && (
                <div className="rounded-full border border-amber-400/20 bg-amber-500/12 px-3 py-1.5 text-xs font-bold text-amber-100 backdrop-blur-xl">
                  {unpaidCount} ej betalda
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="card-premium p-4 sm:p-5 md:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-black text-white sm:text-xl">Liga-tabell</h2>
            <p className="text-muted-premium mt-1 text-sm">
              {isMainLeague
                ? "Det här är den officiella huvudligan."
                : "Ej betalande medlemmar visas med 0 poäng tills betalningen är registrerad."}
            </p>
          </div>

          {table.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-5 text-sm text-white/70 backdrop-blur-xl">
              Det finns inga medlemmar i ligan ännu.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <div className="grid grid-cols-[52px_minmax(0,1fr)_70px] gap-2 border-b border-white/10 bg-white/[0.05] px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-white/55 sm:grid-cols-[56px_minmax(0,1fr)_90px_110px]">
                <div>Plats</div>
                <div>Namn</div>
                <div className="text-right">Poäng</div>
                <div className="hidden text-right sm:block">Status</div>
              </div>

              <div className="divide-y divide-white/8">
                {table.map((entry, index) => {
                  const placement = index + 1;
                  const isPaid = entry.payment_status === "paid";

                  return (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-[52px_minmax(0,1fr)_70px] items-center gap-2 px-3 py-3 sm:grid-cols-[56px_minmax(0,1fr)_90px_110px] ${
                        placement === 1
                          ? "bg-amber-500/[0.06]"
                          : placement === 2
                          ? "bg-white/[0.05]"
                          : placement === 3
                          ? "bg-orange-500/[0.06]"
                          : index % 2 === 0
                          ? "bg-transparent"
                          : "bg-white/[0.025]"
                      }`}
                    >
                      <div>
                        <div
                          className={`inline-flex min-w-[30px] items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-black ${getPlacementStyle(
                            placement
                          )}`}
                        >
                          {placement}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white sm:text-[15px]">
                          {entry.name}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-2 sm:hidden">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                              isPaid
                                ? "border-emerald-400/20 bg-emerald-500/12 text-emerald-100"
                                : "border-amber-400/20 bg-amber-500/12 text-amber-100"
                            }`}
                          >
                            {isPaid ? "Aktiv" : "Ej betald"}
                          </span>

                          {entry.globalPlacement && (
                            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold text-white/75">
                              Globalt #{entry.globalPlacement}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="tabular-nums text-lg font-black leading-none text-white">
                          {entry.points}
                        </div>
                      </div>

                      <div className="hidden justify-end sm:flex">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                            isPaid
                              ? "border-emerald-400/20 bg-emerald-500/12 text-emerald-100"
                              : "border-amber-400/20 bg-amber-500/12 text-amber-100"
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
        </section>
      </div>
    </main>
  );
}