"use client";

import { useMemo } from "react";
import { calculateTable } from "@/lib/tournament";
import type { GroupData } from "@/types/tournament";

export default function GroupSection({
  group,
  onUpdateMatch,
  onResetGroup,
  onTeamClick,
}: {
  group: GroupData;
  onUpdateMatch: (
    groupName: string,
    matchId: number,
    field: "homeGoals" | "awayGoals",
    value: string
  ) => void;
  onResetGroup: (groupName: string) => void;
  onTeamClick?: (teamName: string) => void | Promise<void>;
}) {
  const table = useMemo(() => calculateTable(group.teams, group.matches), [group]);

  function handleScoreFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.select();
  }

  function handleScoreMouseUp(e: React.MouseEvent<HTMLInputElement>) {
    e.preventDefault();
  }

  function renderTeamButton(teamName: string, className: string) {
    if (!onTeamClick) {
      return <p className={className}>{teamName}</p>;
    }

    return (
      <button
        type="button"
        onClick={() => onTeamClick(teamName)}
        className={`${className} cursor-pointer transition hover:text-emerald-300 hover:underline`}
        title={`Öppna ${teamName}`}
      >
        {teamName}
      </button>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr] xl:gap-6">
      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:rounded-[1.75rem]">
        <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(16,185,129,0.16),rgba(2,6,23,0.92)_35%,rgba(2,6,23,0.92)_65%,rgba(16,185,129,0.08))] px-4 py-3 text-white sm:px-5 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/80 sm:text-xs">
                Gruppspel
              </p>
              <h3 className="mt-1 text-lg font-black tracking-tight sm:text-xl">
                {group.name} – matcher
              </h3>
            </div>

            <button
              onClick={() => onResetGroup(group.name)}
              className="h-9 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-extrabold text-white transition hover:border-white/20 hover:bg-white/[0.10]"
            >
              Nollställ grupp
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-5">
          <div className="space-y-3 sm:space-y-4">
            {group.matches.map((match, index) => {
              const isFilled = match.homeGoals !== "" && match.awayGoals !== "";

              const cardTone =
                index % 3 === 0
                  ? "border-emerald-400/12 bg-emerald-500/[0.04]"
                  : index % 3 === 1
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-emerald-300/8 bg-white/[0.03]";

              return (
                <div
                  key={match.id}
                  className={`rounded-[1.25rem] border p-3 shadow-sm transition hover:-translate-y-[1px] hover:border-white/16 hover:bg-white/[0.06] sm:rounded-[1.5rem] sm:p-4 ${
                    isFilled
                      ? "border-emerald-400/25 bg-emerald-500/[0.08] shadow-[0_0_0_1px_rgba(16,185,129,0.10),0_10px_25px_rgba(16,185,129,0.08)]"
                      : cardTone
                  }`}
                >
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] sm:text-[11px] ${
                        isFilled
                          ? "border border-emerald-400/20 bg-emerald-500/14 text-emerald-100"
                          : "border border-white/10 bg-white/[0.05] text-white/72"
                      }`}
                    >
                      Match {match.matchNumber}
                    </div>

                    <div
                      className={`w-fit rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm ring-1 sm:text-xs ${
                        isFilled
                          ? "bg-white/[0.06] text-white/82 ring-white/10"
                          : "bg-white/[0.05] text-white/65 ring-white/10"
                      }`}
                    >
                      {match.date} • {match.time}
                    </div>
                  </div>

                  <div className="space-y-3 md:hidden">
                    <div className="text-center">
                      {renderTeamButton(
                        match.homeTeam,
                        `truncate text-lg font-black ${
                          isFilled ? "text-white" : "text-white/92"
                        }`
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={match.homeGoals}
                        onFocus={handleScoreFocus}
                        onMouseUp={handleScoreMouseUp}
                        onChange={(e) =>
                          onUpdateMatch(group.name, match.id, "homeGoals", e.target.value)
                        }
                        className={`h-11 w-12 rounded-xl border px-2 text-center text-lg font-black shadow-sm outline-none transition [appearance:textfield] ${
                          isFilled
                            ? "border-emerald-400/30 bg-white/[0.10] text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                            : "border-white/10 bg-white/[0.06] text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                        }`}
                      />

                      <span
                        className={`text-lg font-black ${
                          isFilled ? "text-emerald-300" : "text-white/40"
                        }`}
                      >
                        -
                      </span>

                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={match.awayGoals}
                        onFocus={handleScoreFocus}
                        onMouseUp={handleScoreMouseUp}
                        onChange={(e) =>
                          onUpdateMatch(group.name, match.id, "awayGoals", e.target.value)
                        }
                        className={`h-11 w-12 rounded-xl border px-2 text-center text-lg font-black shadow-sm outline-none transition [appearance:textfield] ${
                          isFilled
                            ? "border-emerald-400/30 bg-white/[0.10] text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                            : "border-white/10 bg-white/[0.06] text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                        }`}
                      />
                    </div>

                    <div className="text-center">
                      {renderTeamButton(
                        match.awayTeam,
                        `truncate text-lg font-black ${
                          isFilled ? "text-white" : "text-white/92"
                        }`
                      )}
                    </div>
                  </div>

                  <div className="hidden grid-cols-1 gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <div className="min-w-0 text-center md:text-right">
                      {renderTeamButton(
                        match.homeTeam,
                        `truncate text-base font-black sm:text-lg ${
                          isFilled ? "text-white" : "text-white/92"
                        }`
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={match.homeGoals}
                        onFocus={handleScoreFocus}
                        onMouseUp={handleScoreMouseUp}
                        onChange={(e) =>
                          onUpdateMatch(group.name, match.id, "homeGoals", e.target.value)
                        }
                        className={`h-12 w-14 rounded-xl border px-2 text-center text-lg font-black shadow-sm outline-none transition [appearance:textfield] ${
                          isFilled
                            ? "border-emerald-400/30 bg-white/[0.10] text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                            : "border-white/10 bg-white/[0.06] text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                        }`}
                      />

                      <span
                        className={`text-lg font-black ${
                          isFilled ? "text-emerald-300" : "text-white/40"
                        }`}
                      >
                        -
                      </span>

                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={match.awayGoals}
                        onFocus={handleScoreFocus}
                        onMouseUp={handleScoreMouseUp}
                        onChange={(e) =>
                          onUpdateMatch(group.name, match.id, "awayGoals", e.target.value)
                        }
                        className={`h-12 w-14 rounded-xl border px-2 text-center text-lg font-black shadow-sm outline-none transition [appearance:textfield] ${
                          isFilled
                            ? "border-emerald-400/30 bg-white/[0.10] text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                            : "border-white/10 bg-white/[0.06] text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                        }`}
                      />

                    </div>

                    <div className="min-w-0 text-center md:text-left">
                      {renderTeamButton(
                        match.awayTeam,
                        `truncate text-base font-black sm:text-lg ${
                          isFilled ? "text-white" : "text-white/92"
                        }`
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:rounded-[1.75rem]">
        <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(2,6,23,0.96),rgba(16,185,129,0.12),rgba(2,6,23,0.96))] px-4 py-3 text-white sm:px-5 sm:py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 sm:text-xs">
            Gruppställning
          </p>
          <h3 className="mt-1 text-lg font-black tracking-tight sm:text-xl">
            Live-tabell
          </h3>
        </div>

        <div className="p-3 sm:p-5">
          <div className="md:hidden">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="grid grid-cols-[minmax(0,1fr)_36px_36px_44px] gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-white/50">
                <div>Lag</div>
                <div className="text-center">M</div>
                <div className="text-center">V</div>
                <div className="text-center">P</div>
              </div>

              {table.map((row, index) => {
                const rowClass =
                  index === 0
                    ? "bg-emerald-500/[0.10]"
                    : index === 1
                    ? "bg-emerald-500/[0.06]"
                    : index === 2
                    ? "bg-amber-500/[0.10]"
                    : "bg-transparent";

                const badgeClass =
                  index === 0
                    ? "bg-emerald-500 text-white"
                    : index === 1
                    ? "bg-emerald-400 text-slate-950"
                    : index === 2
                    ? "bg-amber-500 text-white"
                    : "bg-white/10 text-white/75";

                return (
                  <div
                    key={row.team}
                    className={`grid grid-cols-[minmax(0,1fr)_36px_36px_44px] items-center gap-2 border-b border-white/8 px-3 py-3 ${rowClass}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${badgeClass}`}
                      >
                        {index + 1}
                      </div>
                      <span className="truncate text-base font-semibold text-white">
                        {row.team}
                      </span>
                    </div>

                    <div className="text-center text-base text-white/72">
                      {row.played}
                    </div>
                    <div className="text-center text-base text-white/72">
                      {row.won}
                    </div>
                    <div className="text-center text-base font-black text-white">
                      {row.points}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs font-bold uppercase tracking-wide text-white/50">
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
                      ? "bg-emerald-500/[0.10]"
                      : index === 1
                      ? "bg-emerald-500/[0.06]"
                      : index === 2
                      ? "bg-amber-500/[0.10]"
                      : "bg-transparent";

                  const badgeClass =
                    index === 0
                      ? "bg-emerald-500 text-white"
                      : index === 1
                      ? "bg-emerald-400 text-slate-950"
                      : index === 2
                      ? "bg-amber-500 text-white"
                      : "bg-white/10 text-white/75";

                  return (
                    <tr key={row.team} className={`border-b border-white/8 ${rowClass}`}>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${badgeClass}`}
                          >
                            {index + 1}
                          </div>

                          <span className="font-semibold text-white">{row.team}</span>
                        </div>
                      </td>

                      <td className="px-2 py-3 text-center text-white/72">{row.played}</td>
                      <td className="px-2 py-3 text-center text-white/72">{row.won}</td>
                      <td className="px-2 py-3 text-center text-white/72">{row.drawn}</td>
                      <td className="px-2 py-3 text-center text-white/72">{row.lost}</td>
                      <td className="px-2 py-3 text-center text-white/72">{row.goalsFor}</td>
                      <td className="px-2 py-3 text-center text-white/72">
                        {row.goalsAgainst}
                      </td>
                      <td className="px-2 py-3 text-center font-semibold text-white/88">
                        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                      </td>
                      <td className="px-2 py-3 text-center text-base font-black text-white">
                        {row.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/58">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/12 px-3 py-1 text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Gruppetta
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-500/8 px-3 py-1 text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Grupptvåa
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/18 bg-amber-500/10 px-3 py-1 text-amber-100">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Trea
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}