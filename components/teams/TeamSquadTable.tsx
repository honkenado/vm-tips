"use client";

import { useMemo, useState } from "react";
import type { TeamPlayer } from "@/types/team";

type SquadGroup = {
  key: "GK" | "DF" | "MF" | "FW";
  title: string;
  players: TeamPlayer[];
};

const POSITION_ORDER: Record<string, number> = {
  GK: 1,
  DF: 2,
  MF: 3,
  FW: 4,
};

const POSITION_TITLES: Record<"GK" | "DF" | "MF" | "FW", string> = {
  GK: "Målvakter",
  DF: "Försvarare",
  MF: "Mittfältare",
  FW: "Anfallare",
};

function sortPlayers(players: TeamPlayer[]) {
  return [...players].sort((a, b) => {
    const posA = POSITION_ORDER[a.position] ?? 99;
    const posB = POSITION_ORDER[b.position] ?? 99;

    if (posA !== posB) return posA - posB;

    const shirtA = a.shirtNumber ?? 999;
    const shirtB = b.shirtNumber ?? 999;

    if (shirtA !== shirtB) return shirtA - shirtB;

    return a.name.localeCompare(b.name, "sv");
  });
}

function groupPlayers(players: TeamPlayer[]): SquadGroup[] {
  const sorted = sortPlayers(players);

  const groups: SquadGroup[] = [
    { key: "GK", title: POSITION_TITLES.GK, players: [] },
    { key: "DF", title: POSITION_TITLES.DF, players: [] },
    { key: "MF", title: POSITION_TITLES.MF, players: [] },
    { key: "FW", title: POSITION_TITLES.FW, players: [] },
  ];

  for (const player of sorted) {
    const group = groups.find((item) => item.key === player.position);
    if (group) {
      group.players.push(player);
    }
  }

  return groups.filter((group) => group.players.length > 0);
}

function SquadPlayerRow({
  player,
  isOpen,
  onToggle,
}: {
  player: TeamPlayer;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-100 rounded-2xl"
      >
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-900 md:text-base">
            {player.shirtNumber ? `${player.shirtNumber}. ` : ""}
            {player.name}
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-slate-700 shadow-sm">
          {isOpen ? "Dölj" : "Visa"}
        </div>
      </button>

      {isOpen ? (
        <div className="border-t border-slate-200 px-4 py-4">
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-900 md:grid-cols-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Klubb
              </p>
              <p>{player.club ?? "–"}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Ålder
              </p>
              <p>{player.age ?? "–"}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Landskamper
              </p>
              <p>{player.caps ?? "–"}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Mål
              </p>
              <p>{player.goals ?? "–"}</p>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function TeamSquadTable({ squad }: { squad: TeamPlayer[] }) {
  const [openPlayerIds, setOpenPlayerIds] = useState<string[]>([]);

  const groupedSquad = useMemo(() => groupPlayers(squad), [squad]);

  function togglePlayer(playerId: string) {
    setOpenPlayerIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-black tracking-tight text-slate-900">Trupp</h2>
        <p className="text-sm text-slate-900">
          Klicka på en spelare för att visa mer information.
        </p>
      </div>

      {squad.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-900">
          Truppen är inte inläst ännu.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groupedSquad.map((group) => (
            <section
              key={group.key}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">{group.title}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                  {group.players.length} spelare
                </span>
              </div>

              <div className="space-y-3">
                {group.players.map((player) => (
                  <SquadPlayerRow
                    key={player.id}
                    player={player}
                    isOpen={openPlayerIds.includes(player.id)}
                    onToggle={() => togglePlayer(player.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}