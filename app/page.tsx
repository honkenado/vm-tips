"use client";

import LeaderboardSection from "@/components/leaderboard-section";
import AuthStatus from "@/components/auth-status";
import { useEffect, useMemo, useState } from "react";
import BestThirdsSection from "@/components/BestThirdsSection";
import GroupSection from "@/components/GroupSection";
import KnockoutFullSection from "@/components/KnockoutFullSection";
import QualifiedTeamsSection from "@/components/QualifiedTeamsSection";
import SectionCard from "@/components/SectionCard";
import { isDeadlinePassed } from "@/lib/config";
import {
  clearDependentKnockoutSelections,
  buildNextRound,
  generateRandomScore,
  getKnockoutSeedData,
  getLoser,
  initialGroups,
  isGroupComplete,
  isTournamentGroupStageComplete,
  pickRandomWinner,
} from "@/lib/tournament";
import type { GroupData, KnockoutMatch } from "@/types/tournament";

type AppViewMode = "all" | "groups" | "thirds" | "knockout" | "leaderboard";

const viewModeItems: { key: AppViewMode; label: string; mobileLabel: string }[] = [
  { key: "all", label: "Allt", mobileLabel: "Allt" },
  { key: "groups", label: "Grupper", mobileLabel: "Grupper" },
  { key: "thirds", label: "Bästa treor", mobileLabel: "Treor" },
  { key: "knockout", label: "Slutspel", mobileLabel: "Slutspel" },
  { key: "leaderboard", label: "Leaderboard", mobileLabel: "Tabell" },
];

export default function HomePage() {
  const [groups, setGroups] = useState<GroupData[]>(initialGroups);
  const [knockoutWinners, setKnockoutWinners] = useState<Record<string, string>>(
    {}
  );
  const [viewMode, setViewMode] = useState<AppViewMode>("all");
  const [activeGroupLetter, setActiveGroupLetter] = useState("A");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasLoadedFromDatabase, setHasLoadedFromDatabase] = useState(false);

  useEffect(() => {
    async function loadPredictionFromDatabase() {
      try {
        const res = await fetch("/api/prediction");

        if (!res.ok) {
          setHasLoadedFromDatabase(true);
          return;
        }

        const data = await res.json();

        if (data.prediction?.group_stage) {
          setGroups(data.prediction.group_stage);
        }

        if (data.prediction?.knockout) {
          setKnockoutWinners(data.prediction.knockout);
        }
      } catch (error) {
        console.error("Kunde inte läsa från databasen", error);
      } finally {
        setHasLoadedFromDatabase(true);
      }
    }

    loadPredictionFromDatabase();
  }, []);

  async function createLeague() {
    const name = prompt("Vad ska ligan heta?");
    if (!name) return;

    try {
      const res = await fetch("/api/leagues/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Kunde inte skapa liga");
        return;
      }

      alert(
        `Liga skapad!\n\nKod: ${data.league.join_code}\n\nDela koden med dina vänner.`
      );
    } catch (error) {
      console.error("Fel vid skapande av liga", error);
      alert("Något gick fel när ligan skulle skapas");
    }
  }

  function updateMatch(
    groupName: string,
    matchId: number,
    field: "homeGoals" | "awayGoals",
    value: string
  ) {
    if (value !== "" && !/^\d+$/.test(value)) return;

    setGroups((prev) =>
      prev.map((group) =>
        group.name !== groupName
          ? group
          : {
              ...group,
              matches: group.matches.map((match) =>
                match.id === matchId ? { ...match, [field]: value } : match
              ),
            }
      )
    );

    setKnockoutWinners({});
    setSaveMessage(null);
  }

  function resetGroup(groupName: string) {
    setGroups((prev) =>
      prev.map((group) =>
        group.name !== groupName
          ? group
          : {
              ...group,
              matches: group.matches.map((match) => ({
                ...match,
                homeGoals: "",
                awayGoals: "",
              })),
            }
      )
    );

    setKnockoutWinners({});
    setSaveMessage(null);
  }

  function selectWinner(matchId: string, team: string) {
    setKnockoutWinners((prev) => {
      const cleaned = clearDependentKnockoutSelections(prev, matchId);
      return { ...cleaned, [matchId]: team };
    });

    setSaveMessage(null);
  }

  function runHarryBoy() {
    const randomGroups: GroupData[] = initialGroups.map((group) => ({
      ...group,
      matches: group.matches.map((match) => {
        const score = generateRandomScore();
        return { ...match, homeGoals: score.homeGoals, awayGoals: score.awayGoals };
      }),
    }));

    const { round32 } = getKnockoutSeedData(randomGroups);
    const winners: Record<string, string> = {};

    round32.forEach((m) => {
      winners[m.id] = pickRandomWinner(m.home, m.away);
    });

    const r16 = buildNextRound(round32, winners, "r16", "Åttondelsfinal");
    r16.forEach((m) => {
      winners[m.id] = pickRandomWinner(m.home, m.away);
    });

    const qf = buildNextRound(r16, winners, "qf", "Kvartsfinal");
    qf.forEach((m) => {
      winners[m.id] = pickRandomWinner(m.home, m.away);
    });

    const sf = buildNextRound(qf, winners, "sf", "Semifinal");
    sf.forEach((m) => {
      winners[m.id] = pickRandomWinner(m.home, m.away);
    });

    const finalMatch = buildNextRound(sf, winners, "final", "Final");
    finalMatch.forEach((m) => {
      winners[m.id] = pickRandomWinner(m.home, m.away);
    });

    const bronze: KnockoutMatch[] = [
      {
        id: "bronze-1",
        label: "Bronsmatch",
        home: sf[0] ? getLoser(sf[0], winners) : "",
        away: sf[1] ? getLoser(sf[1], winners) : "",
      },
    ];

    bronze.forEach((m) => {
      winners[m.id] = pickRandomWinner(m.home, m.away);
    });

    setGroups(randomGroups);
    setKnockoutWinners(winners);
    setViewMode("all");
    setActiveGroupLetter("A");
    setSaveMessage(null);
  }

  function resetKnockout() {
    setKnockoutWinners({});
    setSaveMessage(null);
  }

  function resetAll() {
    setGroups(initialGroups);
    setKnockoutWinners({});
    setViewMode("all");
    setActiveGroupLetter("A");
    setSaveMessage(null);
  }

  async function savePredictionToDatabase() {
    if (isDeadlinePassed()) {
      setSaveMessage("Deadline har passerat – tipset är låst");
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage(null);

      const res = await fetch("/api/prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groups,
          knockout: knockoutWinners,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveMessage(data.error || "Kunde inte spara tipset");
        return;
      }

      setSaveMessage("Tipset är sparat");
    } catch (error) {
      console.error("Fel vid sparning", error);
      setSaveMessage("Något gick fel vid sparning");
    } finally {
      setIsSaving(false);
    }
  }

  const visibleGroup =
    groups.find((g) => g.name === `Grupp ${activeGroupLetter}`) ?? groups[0];

  const isGroupStageComplete = useMemo(
    () => isTournamentGroupStageComplete(groups),
    [groups]
  );

  const deadlinePassed = isDeadlinePassed();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eef2ff_28%,_#f8fafc_58%,_#e2e8f0_100%)] px-3 py-3 pb-24 sm:px-4 sm:py-4 sm:pb-6 md:px-6 md:py-8 md:pb-8">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute right-[-120px] top-[140px] h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[18%] h-[360px] w-[360px] rounded-full bg-emerald-400/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1600px]">
        <header className="relative mb-4 overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-r from-blue-900 via-indigo-800 to-slate-950 p-4 text-white shadow-[0_20px_50px_rgba(15,23,42,0.28)] sm:mb-6 sm:p-5 md:mb-8 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_35%)]" />
          <div className="absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative">
            <div className="mb-4 flex justify-start lg:justify-end">
              <AuthStatus />
            </div>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-100 sm:text-[11px]">
                  FIFA World Cup 2026
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-6xl">
                  Addes VM tips
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                  Tippa grupper, följ de bästa treorna och spela hela slutspelet fram till
                  den slutliga världsmästaren.
                </p>

                <div className="mt-5 flex flex-wrap gap-2.5 sm:gap-3">
                  <button
                    onClick={runHarryBoy}
                    className="min-h-11 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/25 transition hover:translate-y-[-1px] hover:bg-emerald-600 sm:px-5"
                  >
                    Harry Boy
                  </button>

                  <button
                    onClick={resetAll}
                    className="min-h-11 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-white/20 sm:px-5"
                  >
                    Nollställ
                  </button>

                  <button
                    onClick={savePredictionToDatabase}
                    disabled={isSaving || !hasLoadedFromDatabase || deadlinePassed}
                    className="min-h-11 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-white/20 disabled:opacity-50 sm:px-5"
                  >
                    {deadlinePassed
                      ? "Deadline passerad"
                      : isSaving
                      ? "Sparar..."
                      : "Spara tips"}
                  </button>

                  <button
                    onClick={createLeague}
                    className="min-h-11 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-white/20 sm:px-5"
                  >
                    Skapa liga
                  </button>
                </div>

                {deadlinePassed && (
                  <p className="mt-3 text-sm font-semibold text-amber-300">
                    Deadline har passerat. Tipset är nu låst.
                  </p>
                )}

                {saveMessage && (
                  <p className="mt-3 text-sm text-white/80">{saveMessage}</p>
                )}
              </div>

              <div className="hidden flex-wrap gap-2 md:flex">
                {viewModeItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setViewMode(item.key)}
                    className={`min-h-11 rounded-full px-4 py-2.5 text-sm font-extrabold transition ${
                      viewMode === item.key
                        ? "bg-white text-slate-900 shadow-md"
                        : "border border-white/10 bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-4 sm:gap-6 md:gap-8">
          {(viewMode === "all" || viewMode === "groups") && (
            <SectionCard title="Grupper" subtitle="Välj grupp och fyll i dina matchresultat.">
              <div className="mb-4 flex flex-wrap gap-2 sm:mb-6">
                {"ABCDEFGHIJKL".split("").map((letter) => {
                  const group = groups.find((g) => g.name === `Grupp ${letter}`);
                  const complete = group ? isGroupComplete(group) : false;

                  return (
                    <button
                      key={letter}
                      onClick={() => setActiveGroupLetter(letter)}
                      className={`min-h-11 rounded-full px-4 py-2 text-sm font-extrabold transition ${
                        activeGroupLetter === letter
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                          : complete
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      Grupp {letter} {complete ? "✓" : ""}
                    </button>
                  );
                })}
              </div>

              <GroupSection
                group={visibleGroup}
                onUpdateMatch={updateMatch}
                onResetGroup={resetGroup}
              />
            </SectionCard>
          )}

          {(viewMode === "all" || viewMode === "thirds") && (
            <div className="grid gap-4 sm:gap-6 md:gap-8">
              <BestThirdsSection groups={groups} />
              <QualifiedTeamsSection groups={groups} />
            </div>
          )}

          {(viewMode === "all" || viewMode === "knockout") && (
            <KnockoutFullSection
              groups={groups}
              knockoutWinners={knockoutWinners}
              onSelectWinner={selectWinner}
              onResetKnockout={resetKnockout}
              isGroupStageComplete={isGroupStageComplete}
            />
          )}

          {(viewMode === "all" || viewMode === "leaderboard") && (
            <LeaderboardSection />
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.10)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
          {viewModeItems.map((item) => {
            const active = viewMode === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setViewMode(item.key)}
                className={`min-h-12 rounded-2xl px-2 py-2 text-center text-[11px] font-extrabold leading-tight transition ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {item.mobileLabel}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}