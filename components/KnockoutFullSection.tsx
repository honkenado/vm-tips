"use client";

import { useMemo } from "react";
import SectionCard from "@/components/SectionCard";
import MatchButtons from "@/components/MatchButtons";
import {
  buildRoundFromPairs,
  getKnockoutSeedData,
  getLoser,
} from "@/lib/tournament";
import type { GroupData, KnockoutMatch } from "@/types/tournament";

export default function KnockoutFullSection({
  groups,
  knockoutWinners,
  onSelectWinner,
  onResetKnockout,
  isGroupStageComplete,
}: {
  groups: GroupData[];
  knockoutWinners: Record<string, string>;
  onSelectWinner: (matchId: string, team: string) => void;
  onResetKnockout: () => void;
  isGroupStageComplete: boolean;
}) {
  const { round32 } = useMemo(() => getKnockoutSeedData(groups), [groups]);

  const round16 = buildRoundFromPairs(
    [
      { id: "m89", label: "Match 89", homeFrom: "m74", awayFrom: "m77" },
      { id: "m90", label: "Match 90", homeFrom: "m73", awayFrom: "m75" },
      { id: "m93", label: "Match 93", homeFrom: "m83", awayFrom: "m84" },
      { id: "m94", label: "Match 94", homeFrom: "m81", awayFrom: "m82" },

      { id: "m91", label: "Match 91", homeFrom: "m76", awayFrom: "m78" },
      { id: "m92", label: "Match 92", homeFrom: "m79", awayFrom: "m80" },
      { id: "m95", label: "Match 95", homeFrom: "m86", awayFrom: "m88" },
      { id: "m96", label: "Match 96", homeFrom: "m85", awayFrom: "m87" },
    ],
    knockoutWinners
  );

  const quarterFinals = buildRoundFromPairs(
    [
      { id: "m97", label: "Match 97", homeFrom: "m89", awayFrom: "m90" },
      { id: "m98", label: "Match 98", homeFrom: "m93", awayFrom: "m94" },
      { id: "m99", label: "Match 99", homeFrom: "m91", awayFrom: "m92" },
      { id: "m100", label: "Match 100", homeFrom: "m95", awayFrom: "m96" },
    ],
    knockoutWinners
  );

  const semiFinals = buildRoundFromPairs(
    [
      { id: "m101", label: "Match 101", homeFrom: "m97", awayFrom: "m98" },
      { id: "m102", label: "Match 102", homeFrom: "m99", awayFrom: "m100" },
    ],
    knockoutWinners
  );

  const finalMatch = buildRoundFromPairs(
    [{ id: "m104", label: "Match 104", homeFrom: "m101", awayFrom: "m102" }],
    knockoutWinners
  );

  const thirdPlaceMatch: KnockoutMatch[] = [
    {
      id: "m103",
      label: "Match 103",
      home: semiFinals[0] ? getLoser(semiFinals[0], knockoutWinners) : "",
      away: semiFinals[1] ? getLoser(semiFinals[1], knockoutWinners) : "",
    },
  ];

  const champion = finalMatch[0] ? knockoutWinners[finalMatch[0].id] : "";
  const silverWinner = finalMatch[0] ? getLoser(finalMatch[0], knockoutWinners) : "";
  const bronzeWinner = thirdPlaceMatch[0] ? knockoutWinners[thirdPlaceMatch[0].id] : "";

  const leftRound32 = round32.slice(0, 8);
  const rightRound32 = round32.slice(8, 16);
  const leftRound16 = round16.slice(0, 4);
  const rightRound16 = round16.slice(4, 8);
  const leftQf = quarterFinals.slice(0, 2);
  const rightQf = quarterFinals.slice(2, 4);
  const leftSf = semiFinals.slice(0, 1);
  const rightSf = semiFinals.slice(1, 2);

  const DesktopBracketMatch = ({
    match,
    column,
    row,
    emphasis = "normal",
  }: {
    match: KnockoutMatch;
    column: number;
    row: number;
    emphasis?: "normal" | "final" | "bronze";
  }) => {
    const wrapperClass =
      emphasis === "final"
        ? "rounded-[1.25rem] border border-yellow-300 bg-gradient-to-br from-yellow-50/90 via-amber-50/90 to-yellow-100/90 p-2 shadow-[0_10px_25px_rgba(234,179,8,0.18)]"
        : emphasis === "bronze"
        ? "rounded-[1.25rem] border border-orange-300 bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-orange-100/90 p-2 shadow-[0_10px_25px_rgba(249,115,22,0.14)]"
        : "";

    return (
      <div
        style={{ gridColumn: column, gridRow: `${row} / span 3` }}
        className="justify-self-center"
      >
        <div className={wrapperClass}>
          <MatchButtons
            match={match}
            selectedWinners={knockoutWinners}
            onSelectWinner={onSelectWinner}
            compact
          />
        </div>
      </div>
    );
  };

  if (!isGroupStageComplete) {
    return (
      <SectionCard
        title="Slutspel"
        subtitle="Slutspelet låses upp när alla gruppmatcher är ifyllda."
      >
        <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 text-amber-900 shadow-sm">
          Fyll i samtliga gruppmatcher först för att generera slutspelet.
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Slutspel"
      subtitle="Fast FIFA-träd med rätt matchnummer och rätt kopplingar mellan rundorna."
    >
      <div className="mb-6 flex justify-end">
        <button
          onClick={onResetKnockout}
          className="rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:from-slate-800 hover:to-indigo-900"
        >
          Nollställ slutspel
        </button>
      </div>

      <div className="grid gap-6 xl:hidden">
        {[
          { title: "Round of 32", matches: round32 },
          { title: "Round of 16", matches: round16 },
          { title: "Kvartsfinal", matches: quarterFinals },
          { title: "Semifinal", matches: semiFinals },
          { title: "Bronsmatch", matches: thirdPlaceMatch },
          { title: "Final", matches: finalMatch },
        ].map((round) => (
          <div
            key={round.title}
            className="overflow-hidden rounded-[1.5rem] border border-indigo-200 bg-white shadow-sm"
          >
            <div className="border-b border-indigo-200 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 px-4 py-3 text-white">
              <h3 className="text-lg font-extrabold">{round.title}</h3>
            </div>

            <div className="bg-gradient-to-b from-indigo-50/50 to-white p-4">
              <div className="grid gap-3">
                {round.matches.map((match) => (
                  <MatchButtons
                    key={match.id}
                    match={match}
                    selectedWinners={knockoutWinners}
                    onSelectWinner={onSelectWinner}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="grid gap-3">
          <div className="rounded-[1.75rem] border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 p-6 text-center shadow-sm">
            <div className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-yellow-700">
              Guld
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{champion || "—"}</div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-300 bg-gradient-to-br from-slate-50 to-slate-200 p-5 text-center shadow-sm">
            <div className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-600">
              Silver
            </div>
            <div className="text-xl font-extrabold text-slate-900">{silverWinner || "—"}</div>
          </div>

          <div className="rounded-[1.75rem] border border-orange-300 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-5 text-center shadow-sm">
            <div className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-orange-700">
              Brons
            </div>
            <div className="text-xl font-extrabold text-slate-900">{bronzeWinner || "—"}</div>
          </div>
        </div>
      </div>

      <div className="hidden xl:block">
        <div className="overflow-visible rounded-[1.75rem] border border-indigo-200/80 bg-white shadow-[0_12px_35px_rgba(37,99,235,0.08)]">
          <div className="border-b border-indigo-200 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 px-5 py-4 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100/90">
                  Knockout stage
                </p>
                <h3 className="mt-1 text-xl font-black tracking-tight">Slutspelsträd</h3>
              </div>

              <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white/90">
                FIFA World Cup 2026
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-b from-indigo-100 via-sky-50 to-violet-100 px-5 pb-14 pt-2">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-24 top-4 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl" />
              <div className="absolute right-[-70px] top-14 h-80 w-80 rounded-full bg-violet-400/22 blur-3xl" />
              <div className="absolute bottom-[-90px] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-300/18 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.75),_transparent_60%)]" />
            </div>

            <div className="relative mb-3 flex justify-center">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-[1.5rem] border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 px-6 py-4 text-center shadow-sm">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-700">
                    Guld
                  </div>
                  <div className="text-lg font-extrabold text-slate-900">{champion || "—"}</div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-300 bg-gradient-to-br from-slate-50 to-slate-200 px-6 py-4 text-center shadow-sm">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">
                    Silver
                  </div>
                  <div className="text-lg font-extrabold text-slate-900">{silverWinner || "—"}</div>
                </div>

                <div className="rounded-[1.5rem] border border-orange-300 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 px-6 py-4 text-center shadow-sm">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-orange-700">
                    Brons
                  </div>
                  <div className="text-lg font-extrabold text-slate-900">{bronzeWinner || "—"}</div>
                </div>
              </div>
            </div>

            <div className="relative flex w-full justify-center">
              <div className="relative rounded-[2rem] bg-white/15 px-4 py-4 backdrop-blur-[1px] ring-1 ring-white/25">
                <div className="pointer-events-none absolute inset-y-4 left-1/2 w-[188px] -translate-x-1/2 rounded-[1.75rem] bg-gradient-to-b from-yellow-100/35 via-white/15 to-orange-100/35" />

                <div
                  className="relative grid w-fit items-start gap-x-4 gap-y-0"
                  style={{
                    gridTemplateColumns:
                      "152px 152px 152px 152px 188px 152px 152px 152px 152px",
                    gridTemplateRows: "32px repeat(31, 22px)",
                  }}
                >
                  <div className="text-center text-sm font-black uppercase tracking-wide text-slate-700">
                    R32
                  </div>
                  <div className="text-center text-sm font-black uppercase tracking-wide text-slate-700">
                    R16
                  </div>
                  <div className="text-center text-sm font-black uppercase tracking-wide text-slate-700">
                    Kvartsfinal
                  </div>
                  <div className="text-center text-sm font-black uppercase tracking-wide text-slate-700">
                    Semifinal
                  </div>
                  <div className="text-center text-sm font-black uppercase tracking-wide text-slate-700">
                    Final / Brons
                  </div>
                  <div className="text-center text-sm font-black uppercase tracking-wide text-slate-700">
                    Semifinal
                  </div>
                  <div className="text-center text-sm font-black uppercase tracking-wide text-slate-700">
                    Kvartsfinal
                  </div>
                  <div className="text-center text-sm font-black uppercase tracking-wide text-slate-700">
                    R16
                  </div>
                  <div className="text-center text-sm font-black uppercase tracking-wide text-slate-700">
                    R32
                  </div>

                  {leftRound32[0] && <DesktopBracketMatch match={leftRound32[0]} column={1} row={2} />}
                  {leftRound32[1] && <DesktopBracketMatch match={leftRound32[1]} column={1} row={6} />}
                  {leftRound32[2] && <DesktopBracketMatch match={leftRound32[2]} column={1} row={10} />}
                  {leftRound32[3] && <DesktopBracketMatch match={leftRound32[3]} column={1} row={14} />}
                  {leftRound32[4] && <DesktopBracketMatch match={leftRound32[4]} column={1} row={18} />}
                  {leftRound32[5] && <DesktopBracketMatch match={leftRound32[5]} column={1} row={22} />}
                  {leftRound32[6] && <DesktopBracketMatch match={leftRound32[6]} column={1} row={26} />}
                  {leftRound32[7] && <DesktopBracketMatch match={leftRound32[7]} column={1} row={30} />}

                  {leftRound16[0] && <DesktopBracketMatch match={leftRound16[0]} column={2} row={4} />}
                  {leftRound16[1] && <DesktopBracketMatch match={leftRound16[1]} column={2} row={12} />}
                  {leftRound16[2] && <DesktopBracketMatch match={leftRound16[2]} column={2} row={20} />}
                  {leftRound16[3] && <DesktopBracketMatch match={leftRound16[3]} column={2} row={28} />}

                  {leftQf[0] && <DesktopBracketMatch match={leftQf[0]} column={3} row={8} />}
                  {leftQf[1] && <DesktopBracketMatch match={leftQf[1]} column={3} row={24} />}

                  {leftSf[0] && <DesktopBracketMatch match={leftSf[0]} column={4} row={16} />}

                  {finalMatch[0] && (
                    <DesktopBracketMatch
                      match={finalMatch[0]}
                      column={5}
                      row={16}
                      emphasis="final"
                    />
                  )}

                  {thirdPlaceMatch[0] && (
                    <DesktopBracketMatch
                      match={thirdPlaceMatch[0]}
                      column={5}
                      row={24}
                      emphasis="bronze"
                    />
                  )}

                  {rightSf[0] && <DesktopBracketMatch match={rightSf[0]} column={6} row={16} />}

                  {rightQf[0] && <DesktopBracketMatch match={rightQf[0]} column={7} row={8} />}
                  {rightQf[1] && <DesktopBracketMatch match={rightQf[1]} column={7} row={24} />}

                  {rightRound16[0] && <DesktopBracketMatch match={rightRound16[0]} column={8} row={4} />}
                  {rightRound16[1] && <DesktopBracketMatch match={rightRound16[1]} column={8} row={12} />}
                  {rightRound16[2] && <DesktopBracketMatch match={rightRound16[2]} column={8} row={20} />}
                  {rightRound16[3] && <DesktopBracketMatch match={rightRound16[3]} column={8} row={28} />}

                  {rightRound32[0] && <DesktopBracketMatch match={rightRound32[0]} column={9} row={2} />}
                  {rightRound32[1] && <DesktopBracketMatch match={rightRound32[1]} column={9} row={6} />}
                  {rightRound32[2] && <DesktopBracketMatch match={rightRound32[2]} column={9} row={10} />}
                  {rightRound32[3] && <DesktopBracketMatch match={rightRound32[3]} column={9} row={14} />}
                  {rightRound32[4] && <DesktopBracketMatch match={rightRound32[4]} column={9} row={18} />}
                  {rightRound32[5] && <DesktopBracketMatch match={rightRound32[5]} column={9} row={22} />}
                  {rightRound32[6] && <DesktopBracketMatch match={rightRound32[6]} column={9} row={26} />}
                  {rightRound32[7] && <DesktopBracketMatch match={rightRound32[7]} column={9} row={30} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}