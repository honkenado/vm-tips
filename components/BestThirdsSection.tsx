"use client";

import { useMemo } from "react";
import SectionCard from "@/components/SectionCard";
import { getBestThirds } from "@/lib/tournament";
import type { GroupData } from "@/types/tournament";

export default function BestThirdsSection({ groups }: { groups: GroupData[] }) {
  const bestThirds = useMemo(() => getBestThirds(groups), [groups]);

  const qualifiedThirds = bestThirds
    .filter((team) => team.isQualified)
    .map((team) => team.groupLetter)
    .sort();

  const qualifiedCombinationKey = qualifiedThirds.join("");

  return (
    <SectionCard
      title="Bästa treor"
      subtitle="De 8 bästa grupptreorna går vidare till slutspelet."
    >
      <div className="mb-6 rounded-2xl border border-slate-300 bg-slate-50 p-4">
        <div className="text-sm text-slate-700">
          <span className="font-semibold">Grupper:</span>{" "}
          {qualifiedThirds.length > 0 ? qualifiedThirds.join(", ") : "-"}
        </div>
        <div className="mt-1 text-sm text-slate-700">
          <span className="font-semibold">Kombinationsnyckel:</span>{" "}
          {qualifiedCombinationKey || "-"}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-slate-500">
              <th className="py-2">#</th>
              <th>Grupp</th>
              <th>Lag</th>
              <th>M</th>
              <th>V</th>
              <th>O</th>
              <th>F</th>
              <th>GM</th>
              <th>IM</th>
              <th>+/-</th>
              <th>P</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bestThirds.map((row, index) => (
              <tr
                key={`${row.groupName}-${row.team}`}
                className={`border-b border-slate-200 ${
                  row.isQualified ? "bg-emerald-50" : ""
                }`}
              >
                <td className="py-3 font-semibold">{index + 1}</td>
                <td>{row.groupLetter}</td>
                <td className="font-medium text-slate-900">{row.team}</td>
                <td>{row.played}</td>
                <td>{row.won}</td>
                <td>{row.drawn}</td>
                <td>{row.lost}</td>
                <td>{row.goalsFor}</td>
                <td>{row.goalsAgainst}</td>
                <td>{row.goalDiff}</td>
                <td className="font-bold text-slate-900">{row.points}</td>
                <td>
                  {row.isQualified ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      Vidare
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      Ute
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}