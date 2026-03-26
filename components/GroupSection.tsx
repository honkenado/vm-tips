"use client";

import { useMemo } from "react";
import { calculateTable } from "@/lib/tournament";
import type { GroupData } from "@/types/tournament";

export default function GroupSection({
  group,
  onUpdateMatch,
  onResetGroup,
}: {
  group: GroupData;
  onUpdateMatch: (
    groupName: string,
    matchId: number,
    field: "homeGoals" | "awayGoals",
    value: string
  ) => void;
  onResetGroup: (groupName: string) => void;
}) {
  const table = useMemo(() => calculateTable(group.teams, group.matches), [group]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="overflow-hidden rounded-[1.75rem] border border-indigo-200/80 bg-white shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
        <div className="border-b border-indigo-200 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 px-5 py-4 text-white">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100/90">
                Gruppspel
              </p>
              <h3 className="mt-1 text-xl font-black tracking-tight">
                {group.name} – matcher
              </h3>
            </div>

            <button
              onClick={() => onResetGroup(group.name)}
              className="rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-white/25"
            >
              Nollställ grupp
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-b from-blue-50 via-indigo-50/50 to-white p-4 sm:p-5">
          <div className="space-y-4">
            {group.matches.map((match, index) => {
              const isFilled = match.homeGoals !== "" && match.awayGoals !== "";

              const cardTone =
                index % 3 === 0
                  ? "border-blue-200 from-blue-50 to-white"
                  : index % 3 === 1
                  ? "border-violet-200 from-violet-50 to-white"
                  : "border-cyan-200 from-cyan-50 to-white";

              return (
                <div
                  key={match.id}
                  className={`rounded-[1.5rem] border bg-gradient-to-r p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md ${
                    isFilled
                      ? "border-emerald-400 from-emerald-100 via-lime-50 to-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_10px_25px_rgba(16,185,129,0.10)]"
                      : cardTone
                  }`}
                >
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                        isFilled
                          ? "bg-emerald-200 text-emerald-800 ring-1 ring-emerald-300"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      Match {match.matchNumber}
                    </div>

                    <div
                      className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 ${
                        isFilled
                          ? "bg-white/90 text-emerald-800 ring-emerald-200"
                          : "bg-white/80 text-slate-600 ring-slate-200"
                      }`}
                    >
                      {match.date} • {match.time}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <div className="min-w-0 text-center md:text-right">
                      <p
                        className={`truncate text-base font-black sm:text-lg ${
                          isFilled ? "text-emerald-950" : "text-slate-900"
                        }`}
                      >
                        {match.homeTeam}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={match.homeGoals}
                        onChange={(e) =>
                          onUpdateMatch(group.name, match.id, "homeGoals", e.target.value)
                        }
                        className={`h-12 w-14 rounded-xl border bg-white px-2 text-center text-lg font-black shadow-sm outline-none transition [appearance:textfield] ${
                          isFilled
                            ? "border-emerald-300 text-emerald-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            : "border-indigo-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        }`}
                      />

                      <span
                        className={`text-lg font-black ${
                          isFilled ? "text-emerald-500" : "text-slate-400"
                        }`}
                      >
                        -
                      </span>

                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={match.awayGoals}
                        onChange={(e) =>
                          onUpdateMatch(group.name, match.id, "awayGoals", e.target.value)
                        }
                        className={`h-12 w-14 rounded-xl border bg-white px-2 text-center text-lg font-black shadow-sm outline-none transition [appearance:textfield] ${
                          isFilled
                            ? "border-emerald-300 text-emerald-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            : "border-indigo-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 text-center md:text-left">
                      <p
                        className={`truncate text-base font-black sm:text-lg ${
                          isFilled ? "text-emerald-950" : "text-slate-900"
                        }`}
                      >
                        {match.awayTeam}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-5 py-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
            Gruppställning
          </p>
          <h3 className="mt-1 text-xl font-black tracking-tight">Live-tabell</h3>
        </div>

        <div className="bg-gradient-to-b from-slate-50 to-white p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="py-3 pr-3">Lag</th>
                  <th className="px-2 py-3 text-center">M</th>
                  <th className="px-2 py-3 text-center">V</th>
                  <th className="px-2 py-3 text-center">O</th>
                  <th className="px-2 py-3 text-center">F</th>
                  <th className="px-2 py-3 text-center">GM</th>
                  <th className="px-2 py-3 text-center">IM</th>
                  <th className="px-2 py-3 text-center">+/-</th>
                  <th className="px-2 py-3 text-center">P</th>
                </tr>
              </thead>

              <tbody>
                {table.map((row, index) => {
                  const rowClass =
                    index === 0
                      ? "bg-gradient-to-r from-emerald-50 to-emerald-100/60"
                      : index === 1
                      ? "bg-gradient-to-r from-sky-50 to-sky-100/60"
                      : index === 2
                      ? "bg-gradient-to-r from-amber-50 to-amber-100/60"
                      : "bg-white";

                  const badgeClass =
                    index === 0
                      ? "bg-emerald-600 text-white"
                      : index === 1
                      ? "bg-sky-600 text-white"
                      : index === 2
                      ? "bg-amber-500 text-white"
                      : "bg-slate-200 text-slate-700";

                  return (
                    <tr key={row.team} className={`border-b border-slate-100 ${rowClass}`}>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${badgeClass}`}
                          >
                            {index + 1}
                          </div>

                          <span className="font-semibold text-slate-900">{row.team}</span>
                        </div>
                      </td>

                      <td className="px-2 py-3 text-center text-slate-700">{row.played}</td>
                      <td className="px-2 py-3 text-center text-slate-700">{row.won}</td>
                      <td className="px-2 py-3 text-center text-slate-700">{row.drawn}</td>
                      <td className="px-2 py-3 text-center text-slate-700">{row.lost}</td>
                      <td className="px-2 py-3 text-center text-slate-700">{row.goalsFor}</td>
                      <td className="px-2 py-3 text-center text-slate-700">{row.goalsAgainst}</td>
                      <td className="px-2 py-3 text-center font-semibold text-slate-800">
                        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                      </td>
                      <td className="px-2 py-3 text-center text-base font-black text-slate-900">
                        {row.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Gruppetta
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sky-700">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Grupptvåa
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Trea
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}