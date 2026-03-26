"use client";

import { useMemo } from "react";
import SectionCard from "@/components/SectionCard";
import { calculateTable, getBestThirds } from "@/lib/tournament";
import type { GroupData } from "@/types/tournament";

export default function QualifiedTeamsSection({ groups }: { groups: GroupData[] }) {
  const qualifiedData = useMemo(() => {
    const groupTables = groups.map((group) => {
      const table = calculateTable(group.teams, group.matches);
      const groupLetter = group.name.replace("Grupp ", "");

      return {
        groupLetter,
        winner: table[0],
        runnerUp: table[1],
      };
    });

    const bestThirds = getBestThirds(groups)
      .filter((team) => team.isQualified)
      .sort((a, b) => a.groupLetter.localeCompare(b.groupLetter));

    return {
      groupTables,
      bestThirds,
    };
  }, [groups]);

  return (
    <SectionCard title="Klara lag till slutspelet">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
          <h3 className="mb-3 text-lg font-bold">Gruppvinnare</h3>
          <div className="space-y-2">
            {qualifiedData.groupTables.map((group) => (
              <div key={`winner-${group.groupLetter}`} className="rounded-xl border bg-white p-3">
                <span className="font-semibold">{group.groupLetter}:</span> {group.winner.team}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
          <h3 className="mb-3 text-lg font-bold">Grupptvåor</h3>
          <div className="space-y-2">
            {qualifiedData.groupTables.map((group) => (
              <div key={`runner-${group.groupLetter}`} className="rounded-xl border bg-white p-3">
                <span className="font-semibold">{group.groupLetter}:</span> {group.runnerUp.team}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
          <h3 className="mb-3 text-lg font-bold">Bästa treor</h3>
          <div className="space-y-2">
            {qualifiedData.bestThirds.map((team) => (
              <div
                key={`third-${team.groupLetter}`}
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"
              >
                <span className="font-semibold">{team.groupLetter}:</span> {team.team}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}