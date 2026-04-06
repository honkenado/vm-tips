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
      <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
        <p className="text-sm text-white/78">
          <span className="font-bold text-white">Grupper:</span>{" "}
          {qualifiedRows
            .map((row) =>
              getString(row, ["group", "groupLetter", "group_name"], "?")
            )
            .join(", ")}
        </p>
        <p className="mt-1 text-sm text-white/78">
          <span className="font-bold text-white">Kombinationsnyckel:</span>{" "}
          <span className="font-semibold text-emerald-200">{combinationKey}</span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-white/52">
              <th className="border-b border-white/10 px-3 py-3 font-bold">#</th>
              <th className="border-b border-white/10 px-3 py-3 font-bold">Grupp</th>
              <th className="border-b border-white/10 px-3 py-3 font-bold">Lag</th>
              <th className="border-b border-white/10 px-3 py-3 text-center font-bold">M</th>
              <th className="border-b border-white/10 px-3 py-3 text-center font-bold">V</th>
              <th className="border-b border-white/10 px-3 py-3 text-center font-bold">O</th>
              <th className="border-b border-white/10 px-3 py-3 text-center font-bold">F</th>
              <th className="border-b border-white/10 px-3 py-3 text-center font-bold">GM</th>
              <th className="border-b border-white/10 px-3 py-3 text-center font-bold">IM</th>
              <th className="border-b border-white/10 px-3 py-3 text-center font-bold">+/-</th>
              <th className="border-b border-white/10 px-3 py-3 text-center font-bold">P</th>
              <th className="border-b border-white/10 px-3 py-3 font-bold">Status</th>
            </tr>
          </thead>

          <tbody>
            {bestThirds.map((row, index) => {
              const isQualified = index < qualifiedCount;

              const group = getString(row, ["group", "groupLetter", "group_name"], "?");
              const team = getString(
                row,
                ["team", "teamName", "country", "name"],
                "Okänt lag"
              );

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
                <tr
                  key={`${group}-${team}-${index}`}
                  className={
                    isQualified
                      ? "bg-emerald-500/[0.10]"
                      : isFirstEliminated
                      ? "border-t-2 border-amber-400/30 bg-white/[0.02]"
                      : "bg-white/[0.03]"
                  }
                >
                  <td className="border-b border-white/8 px-3 py-3 text-white/55">
                    {index + 1}
                  </td>
                  <td
                    className={`border-b border-white/8 px-3 py-3 font-semibold ${
                      isQualified ? "text-emerald-100" : "text-white/68"
                    }`}
                  >
                    {group}
                  </td>
                  <td
                    className={`border-b border-white/8 px-3 py-3 font-semibold ${
                      isQualified ? "text-white" : "text-white/82"
                    }`}
                  >
                    {team}
                  </td>
                  <td className="border-b border-white/8 px-3 py-3 text-center text-white/68">
                    {played}
                  </td>
                  <td className="border-b border-white/8 px-3 py-3 text-center text-white/68">
                    {won}
                  </td>
                  <td className="border-b border-white/8 px-3 py-3 text-center text-white/68">
                    {drawn}
                  </td>
                  <td className="border-b border-white/8 px-3 py-3 text-center text-white/68">
                    {lost}
                  </td>
                  <td className="border-b border-white/8 px-3 py-3 text-center text-white/68">
                    {goalsFor}
                  </td>
                  <td className="border-b border-white/8 px-3 py-3 text-center text-white/68">
                    {goalsAgainst}
                  </td>
                  <td className="border-b border-white/8 px-3 py-3 text-center text-white/72">
                    {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                  </td>
                  <td className="border-b border-white/8 px-3 py-3 text-center font-bold text-white">
                    {points}
                  </td>
                  <td className="border-b border-white/8 px-3 py-3">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                        isQualified
                          ? "border-emerald-400/20 bg-emerald-500/12 text-emerald-100"
                          : "border-white/10 bg-white/[0.05] text-white/65"
                      }`}
                    >
                      {isQualified ? "Vidare" : "Ute"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}