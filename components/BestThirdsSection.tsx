"use client";

import { useMemo } from "react";
import SectionCard from "@/components/SectionCard";
import { getBestThirds } from "@/lib/tournament";
import type { GroupData } from "@/types/tournament";

type SafeThirdRow = Record<string, unknown>;

function getGroupLabel(row: SafeThirdRow) {
  if (typeof row.group === "string") return row.group;
  if (typeof row.groupLetter === "string") return row.groupLetter;
  if (typeof row.group_name === "string") return row.group_name;
  if (typeof row.name === "string" && row.name.length === 1) return row.name;
  return "?";
}

function getTeamName(row: SafeThirdRow) {
  if (typeof row.team === "string") return row.team;
  if (typeof row.teamName === "string") return row.teamName;
  if (typeof row.country === "string") return row.country;
  if (typeof row.name === "string") return row.name;
  return "Okänt lag";
}

function getPoints(row: SafeThirdRow) {
  if (typeof row.points === "number") return row.points;
  if (typeof row.p === "number") return row.p;
  return null;
}

function getGoalDiff(row: SafeThirdRow) {
  if (typeof row.goalDifference === "number") return row.goalDifference;
  if (typeof row.diff === "number") return row.diff;
  if (typeof row["+/−"] === "number") return row["+/−"];
  if (typeof row.plusMinus === "number") return row.plusMinus;
  return null;
}

export default function BestThirdsSection({
  groups,
}: {
  groups: GroupData[];
}) {
  const bestThirds = useMemo(
    () => getBestThirds(groups) as unknown as SafeThirdRow[],
    [groups]
  );

  return (
    <SectionCard
      title="Bästa treor"
      subtitle="De åtta bästa treorna går vidare till slutspelet."
    >
      <div className="space-y-3">
        {bestThirds.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600">
            Inga grupptreor att visa ännu.
          </div>
        ) : (
          bestThirds.map((row, index) => {
            const isQualified = index < 8;
            const groupLabel = getGroupLabel(row);
            const teamName = getTeamName(row);
            const points = getPoints(row);
            const goalDiff = getGoalDiff(row);

            return (
              <div
                key={`${groupLabel}-${teamName}-${index}`}
                className={`rounded-2xl border px-4 py-3 ${
                  isQualified
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-base font-semibold text-slate-900">
                    <span
                      className={
                        isQualified
                          ? "font-extrabold text-emerald-700"
                          : "font-extrabold text-slate-600"
                      }
                    >
                      {groupLabel}:
                    </span>{" "}
                    {teamName}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                    {points !== null && (
                      <span className="rounded-full bg-white/80 px-2.5 py-1 font-semibold">
                        {points} p
                      </span>
                    )}
                    {goalDiff !== null && (
                      <span className="rounded-full bg-white/80 px-2.5 py-1 font-semibold">
                        +/- {goalDiff}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-1 font-bold ${
                        isQualified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isQualified ? "Vidare" : "Ute"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </SectionCard>
  );
}