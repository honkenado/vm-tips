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
          setGroups(data.results.group_stage);
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-700">
                Admin
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                Sätt officiellt facit
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Fyll i de verkliga resultaten i grupperna och välj rätt vinnare i
                slutspelet.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={saveResults}
                  disabled={isSaving || !hasLoaded}
                  className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSaving ? "Sparar..." : "Spara facit"}
                </button>

                <button
                  onClick={resetAllResults}
                  disabled={!hasLoaded || isSaving}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Nollställ facit
                </button>
              </div>

              {message && (
                <p className="mt-3 text-sm text-slate-600">{message}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "Allt" },
                { key: "groups", label: "Grupper" },
                { key: "knockout", label: "Slutspel" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setViewMode(item.key as ViewMode)}
                  className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition ${
                    viewMode === item.key
                      ? "bg-slate-900 text-white shadow-md"
                      : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          {(viewMode === "all" || viewMode === "groups") && (
            <SectionCard
              title="Grupper"
              subtitle="Fyll i officiella matchresultat."
            >
              <div className="mb-6 flex flex-wrap gap-2">
                {"ABCDEFGHIJKL".split("").map((letter) => (
                  <button
                    key={letter}
                    onClick={() => setActiveGroupLetter(letter)}
                    className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                      activeGroupLetter === letter
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                        : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
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