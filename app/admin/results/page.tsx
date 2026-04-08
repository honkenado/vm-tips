"use client";

import { useEffect, useMemo, useState } from "react";
import GroupSection from "@/components/GroupSection";
import KnockoutFullSection from "@/components/KnockoutFullSection";
import SectionCard from "@/components/SectionCard";
import {
  clearDependentKnockoutSelections,
  initialGroups,
  isTournamentGroupStageComplete,
} from "@/lib/tournament";
import type { GroupData, ViewMode } from "@/types/tournament";

function migrateLegacyGroupNames(groups: GroupData[]): GroupData[] {
  const migrateTeamName = (team: string) => {
    if (team === "FIFA playoff 1") return "DR Kongo";
    if (team === "FIFA playoff 2") return "Irak";
    return team;
  };

  return groups.map((group) => ({
    ...group,
    teams: group.teams.map(migrateTeamName),
    matches: group.matches.map((match) => ({
      ...match,
      homeTeam: migrateTeamName(match.homeTeam),
      awayTeam: migrateTeamName(match.awayTeam),
    })),
  }));
}

export default function AdminResultsPage() {
  const [groups, setGroups] = useState<GroupData[]>(initialGroups);
  const [knockoutWinners, setKnockoutWinners] = useState<Record<string, string>>(
    {}
  );
  const [activeGroupLetter, setActiveGroupLetter] = useState("A");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await fetch("/api/admin/results");
        const data = await res.json();

        if (!res.ok) {
          setMessage(data.error || "Kunde inte läsa facit");
          return;
        }

        if (data.results?.group_stage?.length) {
          setGroups(migrateLegacyGroupNames(data.results.group_stage));
        }

        if (data.results?.knockout) {
          setKnockoutWinners(data.results.knockout);
        }
      } catch (error) {
        console.error(error);
        setMessage("Något gick fel");
      } finally {
        setHasLoaded(true);
      }
    }

    loadResults();
  }, []);

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
    setMessage(null);
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
    setMessage(null);
  }

  function resetAllResults() {
    setGroups(initialGroups);
    setKnockoutWinners({});
    setActiveGroupLetter("A");
    setViewMode("all");
    setMessage("Facit återställt lokalt. Klicka på 'Spara facit' för att spara.");
  }

  function selectWinner(matchId: string, team: string) {
    setKnockoutWinners((prev) => {
      const cleaned = clearDependentKnockoutSelections(prev, matchId);
      return { ...cleaned, [matchId]: team };
    });

    setMessage(null);
  }

  async function saveResults() {
    try {
      setIsSaving(true);
      setMessage(null);

      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_stage: groups,
          knockout: knockoutWinners,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte spara facit");
        return;
      }

      setMessage("Facit sparat");
    } catch (error) {
      console.error(error);
      setMessage("Något gick fel");
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

  function secondaryButtonClassName() {
    return "inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-[13px] font-semibold text-white/90 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50";
  }

  function primaryButtonClassName() {
    return "inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-[13px] font-extrabold text-slate-900 shadow-md transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50";
  }

  return (
    <main className="min-h-screen overflow-x-hidden px-3 py-3 pb-10 sm:px-4 sm:py-4 md:px-6 md:py-8">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#020617]">
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute right-[-120px] top-[140px] h-[420px] w-[420px] rounded-full bg-emerald-400/8 blur-[140px]" />
        <div className="absolute bottom-[-140px] left-[18%] h-[360px] w-[360px] rounded-full bg-emerald-300/6 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-[1600px]">
        <header className="relative mb-4 overflow-hidden rounded-[2rem] border border-white/6 bg-[#020617] p-4 text-white shadow-[0_30px_100px_rgba(0,0,0,0.7)] sm:mb-5 sm:p-5 md:mb-6 md:p-6">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.14),rgba(2,6,23,0.0)_35%,rgba(2,6,23,0.0)_65%,rgba(16,185,129,0.06))]" />
          <div className="absolute -left-24 top-0 h-[220px] w-[220px] rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute right-[-50px] top-6 h-[180px] w-[180px] rounded-full bg-emerald-400/8 blur-[90px]" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/85 backdrop-blur-xl sm:text-[11px]">
                Adminläge
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
                Sätt officiellt facit
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 md:text-base">
                Fyll i de verkliga resultaten i grupperna och välj rätt vinnare i
                slutspelet.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={saveResults}
                  disabled={isSaving || !hasLoaded}
                  className={primaryButtonClassName()}
                >
                  {isSaving ? "Sparar..." : "Spara facit"}
                </button>

                <button
                  onClick={resetAllResults}
                  disabled={!hasLoaded || isSaving}
                  className={secondaryButtonClassName()}
                >
                  Nollställ facit
                </button>
              </div>

              {message && (
                <p className="mt-3 text-sm text-white/80">{message}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "Allt" },
                { key: "groups", label: "Grupper" },
                { key: "knockout", label: "Slutspel" },
              ].map((item) => {
                const active = viewMode === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => setViewMode(item.key as ViewMode)}
                    className={`h-10 rounded-full px-4 text-[13px] font-bold transition ${
                      active
                        ? "bg-white text-slate-900 shadow-md"
                        : "border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.10]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <div className="grid gap-4 sm:gap-6 md:gap-8">
          {(viewMode === "all" || viewMode === "groups") && (
            <SectionCard
              title="Grupper"
              subtitle="Fyll i officiella matchresultat."
            >
              <div className="mb-4 flex flex-wrap gap-2 sm:mb-6">
                {"ABCDEFGHIJKL".split("").map((letter) => (
                  <button
                    key={letter}
                    onClick={() => setActiveGroupLetter(letter)}
                    className={`min-h-11 rounded-full px-4 py-2 text-sm font-extrabold transition ${
                      activeGroupLetter === letter
                        ? "bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)]"
                        : "border border-white/10 bg-white/[0.05] text-white/85 hover:bg-white/[0.08]"
                    }`}
                  >
                    Grupp {letter}
                  </button>
                ))}
              </div>

              <GroupSection
                group={visibleGroup}
                onUpdateMatch={updateMatch}
                onResetGroup={resetGroup}
              />
            </SectionCard>
          )}

          {(viewMode === "all" || viewMode === "knockout") && (
            <KnockoutFullSection
              groups={groups}
              knockoutWinners={knockoutWinners}
              onSelectWinner={selectWinner}
              onResetKnockout={() => {
                setKnockoutWinners({});
                setMessage(null);
              }}
              isGroupStageComplete={isGroupStageComplete}
            />
          )}
        </div>
      </div>
    </main>
  );
}