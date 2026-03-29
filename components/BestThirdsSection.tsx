"use client";

import { useMemo } from "react";
import SectionCard from "@/components/SectionCard";
import { getBestThirds } from "@/lib/tournament";
import type { GroupData } from "@/types/tournament";

type SafeThirdRow = Record<string, unknown>;

function getString(row: SafeThirdRow, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string") return value;
  }
  return fallback;
}

function getNumber(row: SafeThirdRow, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number") return value;
  }
  return fallback;
}

export default function BestThirdsSection({
  groups,
}: {
  groups: GroupData[];
}) {
  const bestThirds = useMemo(
    () => (getBestThirds(groups) as unknown as SafeThirdRow[]) ?? [],
    [groups]
  );

  const qualifiedCount = 8;
  const qualifiedRows = bestThirds.slice(0, qualifiedCount);
  const combinationKey = qualifiedRows
    .map((row) => getString(row, ["group", "groupLetter", "group_name"], "?"))
    .join("");

  return (
    <SectionCard
      title="Bästa treor"
      subtitle="De åtta bästa treorna går vidare till slutspelet."
    >
      <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm text-slate-700">
          <span className="font-bold text-slate-900">Grupper:</span>{" "}
          {qualifiedRows
            .map((row) =>
              getString(row, ["group", "groupLetter", "group_name"], "?")
            )
            .join(", ")}
        </p>
        <p className="mt-1 text-sm text-slate-700">
          <span className="font-bold text-slate-900">Kombinationsnyckel:</span>{" "}
          <span className="font-semibold text-slate-900">{combinationKey}</span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="border-b border-slate-200 px-3 py-3 font-bold">#</th>
              <th className="border-b border-slate-200 px-3 py-3 font-bold">Grupp</th>
              <th className="border-b border-slate-200 px-3 py-3 font-bold">Lag</th>
              <th className="border-b border-slate-200 px-3 py-3 text-center font-bold">M</th>
              <th className="border-b border-slate-200 px-3 py-3 text-center font-bold">V</th>
              <th className="border-b border-slate-200 px-3 py-3 text-center font-bold">O</th>
              <th className="border-b border-slate-200 px-3 py-3 text-center font-bold">F</th>
              <th className="border-b border-slate-200 px-3 py-3 text-center font-bold">GM</th>
              <th className="border-b border-slate-200 px-3 py-3 text-center font-bold">IM</th>
              <th className="border-b border-slate-200 px-3 py-3 text-center font-bold">+/-</th>
              <th className="border-b border-slate-200 px-3 py-3 text-center font-bold">P</th>
              <th className="border-b border-slate-200 px-3 py-3 font-bold">Status</th>
            </tr>
          </thead>

          <tbody>
  {bestThirds.map((row, index) => {
    const isQualified = index < qualifiedCount;

    const group = getString(row, ["group", "groupLetter", "group_name"], "?");
    const team = getString(row, ["team", "teamName", "country", "name"], "Okänt lag");

    const played = getNumber(row, ["played", "matches", "m"]);
    const won = getNumber(row, ["won", "wins", "v"]);
    const drawn = getNumber(row, ["drawn", "draws", "o"]);
    const lost = getNumber(row, ["lost", "losses", "f"]);
    const goalsFor = getNumber(row, ["goalsFor", "gf", "gm"]);
    const goalsAgainst = getNumber(row, ["goalsAgainst", "ga", "im"]);
    const goalDiff = getNumber(row, ["goalDifference", "gd", "diff"]);
    const points = getNumber(row, ["points", "p"]);

    const isFirstEliminated = index === qualifiedCount;

    return (
      <>
        {isFirstEliminated && (
          <tr>
            <td colSpan={12} className="px-0 py-0">
              <div className="my-1 h-1 rounded-full bg-slate-400" />
            </td>
          </tr>
        )}

        <tr
          key={`${group}-${team}-${index}`}
          className={isQualified ? "bg-emerald-50/80" : "bg-slate-50/70"}
        >
          <td className="border-b border-slate-200 px-3 py-3 text-slate-500">
            {index + 1}
          </td>
          <td
            className={`border-b border-slate-200 px-3 py-3 font-semibold ${
              isQualified ? "text-slate-700" : "text-slate-500"
            }`}
          >
            {group}
          </td>
          <td
            className={`border-b border-slate-200 px-3 py-3 font-semibold ${
              isQualified ? "text-slate-900" : "text-slate-700"
            }`}
          >
            {team}
          </td>
          <td className="border-b border-slate-200 px-3 py-3 text-center text-slate-600">
            {played}
          </td>
          <td className="border-b border-slate-200 px-3 py-3 text-center text-slate-600">
            {won}
          </td>
          <td className="border-b border-slate-200 px-3 py-3 text-center text-slate-600">
            {drawn}
          </td>
          <td className="border-b border-slate-200 px-3 py-3 text-center text-slate-600">
            {lost}
          </td>
          <td className="border-b border-slate-200 px-3 py-3 text-center text-slate-600">
            {goalsFor}
          </td>
          <td className="border-b border-slate-200 px-3 py-3 text-center text-slate-600">
            {goalsAgainst}
          </td>
          <td className="border-b border-slate-200 px-3 py-3 text-center text-slate-600">
            {goalDiff}
          </td>
          <td className="border-b border-slate-200 px-3 py-3 text-center font-bold text-slate-900">
            {points}
          </td>
          <td className="border-b border-slate-200 px-3 py-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                isQualified
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {isQualified ? "Vidare" : "Ute"}
            </span>
          </td>
        </tr>
      </>
    );
  })}
</tbody>
        </table>
      </div>
    </SectionCard>
  );
}