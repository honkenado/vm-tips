"use client";

import { useMemo, useState } from "react";

type Player = {
  id: string;
  name: string;
  position: string;
  shirt_number: number | null;
};

type Slot = {
  slot_key: string;
  role_label: string;
  x_pos: number;
  y_pos: number;
  player_id: string | null;
};

const FORMATIONS: Record<
  string,
  Array<{ slot_key: string; role_label: string; x_pos: number; y_pos: number }>
> = {
  "4-3-3": [
    { slot_key: "GK", role_label: "GK", x_pos: 50, y_pos: 86 },

    { slot_key: "LB", role_label: "LB", x_pos: 22, y_pos: 68 },
    { slot_key: "LCB", role_label: "LCB", x_pos: 38, y_pos: 70 },
    { slot_key: "RCB", role_label: "RCB", x_pos: 62, y_pos: 70 },
    { slot_key: "RB", role_label: "RB", x_pos: 78, y_pos: 68 },

    { slot_key: "LCM", role_label: "LCM", x_pos: 30, y_pos: 50 },
    { slot_key: "CM", role_label: "CM", x_pos: 50, y_pos: 46 },
    { slot_key: "RCM", role_label: "RCM", x_pos: 70, y_pos: 50 },

    { slot_key: "LW", role_label: "LW", x_pos: 24, y_pos: 22 },
    { slot_key: "ST", role_label: "ST", x_pos: 50, y_pos: 16 },
    { slot_key: "RW", role_label: "RW", x_pos: 76, y_pos: 22 },
  ],

  "4-4-2": [
    { slot_key: "GK", role_label: "GK", x_pos: 50, y_pos: 86 },

    { slot_key: "LB", role_label: "LB", x_pos: 22, y_pos: 68 },
    { slot_key: "LCB", role_label: "LCB", x_pos: 38, y_pos: 70 },
    { slot_key: "RCB", role_label: "RCB", x_pos: 62, y_pos: 70 },
    { slot_key: "RB", role_label: "RB", x_pos: 78, y_pos: 68 },

    { slot_key: "LM", role_label: "LM", x_pos: 20, y_pos: 46 },
    { slot_key: "LCM", role_label: "LCM", x_pos: 40, y_pos: 48 },
    { slot_key: "RCM", role_label: "RCM", x_pos: 60, y_pos: 48 },
    { slot_key: "RM", role_label: "RM", x_pos: 80, y_pos: 46 },

    { slot_key: "LS", role_label: "LS", x_pos: 40, y_pos: 20 },
    { slot_key: "RS", role_label: "RS", x_pos: 60, y_pos: 20 },
  ],

  "3-5-2": [
    { slot_key: "GK", role_label: "GK", x_pos: 50, y_pos: 86 },

    { slot_key: "LCB", role_label: "LCB", x_pos: 30, y_pos: 70 },
    { slot_key: "CB", role_label: "CB", x_pos: 50, y_pos: 72 },
    { slot_key: "RCB", role_label: "RCB", x_pos: 70, y_pos: 70 },

    { slot_key: "LWB", role_label: "LWB", x_pos: 14, y_pos: 46 },
    { slot_key: "LCM", role_label: "LCM", x_pos: 36, y_pos: 50 },
    { slot_key: "CM", role_label: "CM", x_pos: 50, y_pos: 44 },
    { slot_key: "RCM", role_label: "RCM", x_pos: 64, y_pos: 50 },
    { slot_key: "RWB", role_label: "RWB", x_pos: 86, y_pos: 46 },

    { slot_key: "LS", role_label: "LS", x_pos: 40, y_pos: 20 },
    { slot_key: "RS", role_label: "RS", x_pos: 60, y_pos: 20 },
  ],

  "4-2-3-1": [
    { slot_key: "GK", role_label: "GK", x_pos: 50, y_pos: 86 },

    { slot_key: "LB", role_label: "LB", x_pos: 22, y_pos: 68 },
    { slot_key: "LCB", role_label: "LCB", x_pos: 38, y_pos: 70 },
    { slot_key: "RCB", role_label: "RCB", x_pos: 62, y_pos: 70 },
    { slot_key: "RB", role_label: "RB", x_pos: 78, y_pos: 68 },

    { slot_key: "LDM", role_label: "LDM", x_pos: 40, y_pos: 55 },
    { slot_key: "RDM", role_label: "RDM", x_pos: 60, y_pos: 55 },

    { slot_key: "LAM", role_label: "LAM", x_pos: 24, y_pos: 34 },
    { slot_key: "CAM", role_label: "CAM", x_pos: 50, y_pos: 30 },
    { slot_key: "RAM", role_label: "RAM", x_pos: 76, y_pos: 34 },

    { slot_key: "ST", role_label: "ST", x_pos: 50, y_pos: 16 },
  ],

  "4-1-4-1": [
    { slot_key: "GK", role_label: "GK", x_pos: 50, y_pos: 86 },

    { slot_key: "LB", role_label: "LB", x_pos: 22, y_pos: 68 },
    { slot_key: "LCB", role_label: "LCB", x_pos: 38, y_pos: 70 },
    { slot_key: "RCB", role_label: "RCB", x_pos: 62, y_pos: 70 },
    { slot_key: "RB", role_label: "RB", x_pos: 78, y_pos: 68 },

    { slot_key: "DM", role_label: "DM", x_pos: 50, y_pos: 58 },

    { slot_key: "LM", role_label: "LM", x_pos: 18, y_pos: 38 },
    { slot_key: "LCM", role_label: "LCM", x_pos: 38, y_pos: 40 },
    { slot_key: "RCM", role_label: "RCM", x_pos: 62, y_pos: 40 },
    { slot_key: "RM", role_label: "RM", x_pos: 82, y_pos: 38 },

    { slot_key: "ST", role_label: "ST", x_pos: 50, y_pos: 16 },
  ],

  "3-4-3": [
    { slot_key: "GK", role_label: "GK", x_pos: 50, y_pos: 86 },

    { slot_key: "LCB", role_label: "LCB", x_pos: 30, y_pos: 70 },
    { slot_key: "CB", role_label: "CB", x_pos: 50, y_pos: 72 },
    { slot_key: "RCB", role_label: "RCB", x_pos: 70, y_pos: 70 },

    { slot_key: "LM", role_label: "LM", x_pos: 18, y_pos: 48 },
    { slot_key: "LCM", role_label: "LCM", x_pos: 40, y_pos: 48 },
    { slot_key: "RCM", role_label: "RCM", x_pos: 60, y_pos: 48 },
    { slot_key: "RM", role_label: "RM", x_pos: 82, y_pos: 48 },

    { slot_key: "LW", role_label: "LW", x_pos: 24, y_pos: 22 },
    { slot_key: "ST", role_label: "ST", x_pos: 50, y_pos: 16 },
    { slot_key: "RW", role_label: "RW", x_pos: 76, y_pos: 22 },
  ],

  "5-3-2": [
    { slot_key: "GK", role_label: "GK", x_pos: 50, y_pos: 86 },

    { slot_key: "LWB", role_label: "LWB", x_pos: 12, y_pos: 64 },
    { slot_key: "LCB", role_label: "LCB", x_pos: 30, y_pos: 70 },
    { slot_key: "CB", role_label: "CB", x_pos: 50, y_pos: 72 },
    { slot_key: "RCB", role_label: "RCB", x_pos: 70, y_pos: 70 },
    { slot_key: "RWB", role_label: "RWB", x_pos: 88, y_pos: 64 },

    { slot_key: "LCM", role_label: "LCM", x_pos: 34, y_pos: 44 },
    { slot_key: "CM", role_label: "CM", x_pos: 50, y_pos: 40 },
    { slot_key: "RCM", role_label: "RCM", x_pos: 66, y_pos: 44 },

    { slot_key: "LS", role_label: "LS", x_pos: 40, y_pos: 18 },
    { slot_key: "RS", role_label: "RS", x_pos: 60, y_pos: 18 },
  ],

  "4-5-1": [
    { slot_key: "GK", role_label: "GK", x_pos: 50, y_pos: 86 },

    { slot_key: "LB", role_label: "LB", x_pos: 22, y_pos: 68 },
    { slot_key: "LCB", role_label: "LCB", x_pos: 38, y_pos: 70 },
    { slot_key: "RCB", role_label: "RCB", x_pos: 62, y_pos: 70 },
    { slot_key: "RB", role_label: "RB", x_pos: 78, y_pos: 68 },

    { slot_key: "LM", role_label: "LM", x_pos: 16, y_pos: 42 },
    { slot_key: "LCM", role_label: "LCM", x_pos: 34, y_pos: 44 },
    { slot_key: "CM", role_label: "CM", x_pos: 50, y_pos: 40 },
    { slot_key: "RCM", role_label: "RCM", x_pos: 66, y_pos: 44 },
    { slot_key: "RM", role_label: "RM", x_pos: 84, y_pos: 42 },

    { slot_key: "ST", role_label: "ST", x_pos: 50, y_pos: 16 },
  ],
};

function makeBaseSlots(formation: string): Slot[] {
  return (FORMATIONS[formation] ?? FORMATIONS["4-3-3"]).map((slot) => ({
    ...slot,
    player_id: null,
  }));
}

function mergeSlots(formation: string, savedSlots: Slot[]): Slot[] {
  const base = makeBaseSlots(formation);
  const savedMap = new Map(savedSlots.map((slot) => [slot.slot_key, slot]));

  return base.map((slot) => {
    const saved = savedMap.get(slot.slot_key);
    return saved
      ? {
          slot_key: slot.slot_key,
          role_label: slot.role_label,
          x_pos: slot.x_pos,
          y_pos: slot.y_pos,
          player_id: saved.player_id ?? null,
        }
      : slot;
  });
}

export default function LineupEditor({
  teamId,
  players,
  initialFormation,
  initialSlots,
}: {
  teamId: string;
  players: Player[];
  initialFormation: string;
  initialSlots: Slot[];
}) {
  const [formation, setFormation] = useState(initialFormation || "4-3-3");
  const [slots, setSlots] = useState<Slot[]>(
    mergeSlots(initialFormation || "4-3-3", initialSlots ?? [])
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const playerMap = useMemo(
    () => Object.fromEntries(players.map((player) => [player.id, player])),
    [players]
  );

  function applyFormation(newFormation: string) {
    setFormation(newFormation);
    setSlots((prev) => mergeSlots(newFormation, prev));
  }

  function handleDrop(slotKey: string, playerId: string) {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.slot_key === slotKey
          ? { ...slot, player_id: playerId }
          : slot.player_id === playerId
          ? { ...slot, player_id: null }
          : slot
      )
    );
  }

  function clearSlot(slotKey: string) {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.slot_key === slotKey ? { ...slot, player_id: null } : slot
      )
    );
  }

  async function saveLineup() {
    try {
      setSaving(true);
      setMessage("");

      const res = await fetch(`/api/admin/lineups/${teamId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lineup_name: "Startelva",
          formation,
          slots,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte spara uppställningen");
        return;
      }

      setMessage("Uppställningen sparades.");
    } catch {
      setMessage("Något gick fel när uppställningen skulle sparas");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-300 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-black">Formation</label>
            <select
              value={formation}
              onChange={(e) => applyFormation(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-black"
            >
              <option value="4-3-3">4-3-3</option>
              <option value="4-4-2">4-4-2</option>
              <option value="3-5-2">3-5-2</option>
              <option value="4-2-3-1">4-2-3-1</option>
              <option value="4-1-4-1">4-1-4-1</option>
              <option value="3-4-3">3-4-3</option>
              <option value="5-3-2">5-3-2</option>
              <option value="4-5-1">4-5-1</option>
            </select>
          </div>

          <button
            type="button"
            onClick={saveLineup}
            disabled={saving}
            className="rounded-xl bg-black px-4 py-2 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Sparar..." : "Spara uppställning"}
          </button>
        </div>

        {message && (
          <div className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-black">
            {message}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-gray-300 bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold text-black">Spelare</h2>

          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", player.id);
                }}
                className="cursor-grab rounded-xl border border-gray-300 bg-gray-50 p-3 text-black shadow-sm"
              >
                <div className="font-medium">
                  {player.shirt_number ? `${player.shirt_number}. ` : ""}
                  {player.name}
                </div>
                <div className="text-sm text-gray-600">{player.position}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-300 bg-[#10212b] p-4">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1f6a3d] via-[#175433] to-[#103a24] shadow-inner">
            {/* Mjuk grässtruktur */}
            <div className="absolute inset-0 opacity-[0.08]">
              <div className="h-full w-full bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.35)_50%,transparent_100%)] bg-[length:100%_74px]" />
            </div>

            {/* Yttre planlinje */}
            <div className="absolute inset-3 rounded-[1.25rem] border border-white/20" />

            {/* Mittlinje */}
            <div className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-white/20" />

            {/* Mittcirkel */}
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

            {/* Mittpunkt */}
            <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />

            {/* Övre straffområde */}
            <div className="absolute left-1/2 top-3 h-[112px] w-[220px] -translate-x-1/2 border-x border-b border-white/20" />
            <div className="absolute left-1/2 top-3 h-[50px] w-[92px] -translate-x-1/2 border-x border-b border-white/20" />
            <div className="absolute left-1/2 top-[86px] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white/70" />

            {/* Nedre straffområde */}
            <div className="absolute bottom-3 left-1/2 h-[112px] w-[220px] -translate-x-1/2 border-x border-t border-white/20" />
            <div className="absolute bottom-3 left-1/2 h-[50px] w-[92px] -translate-x-1/2 border-x border-t border-white/20" />
            <div className="absolute bottom-[86px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white/70" />

            {/* Mål */}
            <div className="absolute left-1/2 top-0 h-3 w-[84px] -translate-x-1/2 rounded-b-md border-x border-b border-white/20 bg-white/5" />
            <div className="absolute bottom-0 left-1/2 h-3 w-[84px] -translate-x-1/2 rounded-t-md border-x border-t border-white/20 bg-white/5" />

            {slots.map((slot) => {
              const player = slot.player_id ? playerMap[slot.player_id] : null;

              return (
                <div
                  key={slot.slot_key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const playerId = e.dataTransfer.getData("text/plain");
                    if (playerId) handleDrop(slot.slot_key, playerId);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${slot.x_pos}%`,
                    top: `${slot.y_pos}%`,
                  }}
                >
                  <div className="flex w-[96px] flex-col items-center">
                    <button
                      type="button"
                      onDoubleClick={() => clearSlot(slot.slot_key)}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border text-[11px] font-black shadow-lg backdrop-blur-sm ${
                        player
                          ? "border-slate-200 bg-white text-slate-900"
                          : "border-white/20 bg-white/15 text-white/80"
                      }`}
                      title={`${slot.role_label} — dubbelklicka för att rensa`}
                    >
                      {player?.shirt_number ?? slot.role_label}
                    </button>

                    <div className="mt-1.5 max-w-[96px] text-center text-[11px] font-semibold leading-tight text-white drop-shadow-sm">
                      {player ? player.name : slot.role_label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-gray-300">
            Dra spelare från listan till planen. Dubbelklicka på en position för att rensa den.
          </p>
        </div>
      </div>
    </div>
  );
}