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
    { slot_key: "GK", role_label: "GK", x_pos: 50, y_pos: 90 },

    { slot_key: "LB", role_label: "LB", x_pos: 18, y_pos: 72 },
    { slot_key: "LCB", role_label: "LCB", x_pos: 38, y_pos: 74 },
    { slot_key: "RCB", role_label: "RCB", x_pos: 62, y_pos: 74 },
    { slot_key: "RB", role_label: "RB", x_pos: 82, y_pos: 72 },

    { slot_key: "LCM", role_label: "LCM", x_pos: 28, y_pos: 52 },
    { slot_key: "CM", role_label: "CM", x_pos: 50, y_pos: 48 },
    { slot_key: "RCM", role_label: "RCM", x_pos: 72, y_pos: 52 },

    { slot_key: "LW", role_label: "LW", x_pos: 20, y_pos: 24 },
    { slot_key: "ST", role_label: "ST", x_pos: 50, y_pos: 18 },
    { slot_key: "RW", role_label: "RW", x_pos: 80, y_pos: 24 },
  ],
  "4-4-2": [
    { slot_key: "GK", role_label: "GK", x_pos: 50, y_pos: 90 },

    { slot_key: "LB", role_label: "LB", x_pos: 18, y_pos: 72 },
    { slot_key: "LCB", role_label: "LCB", x_pos: 38, y_pos: 74 },
    { slot_key: "RCB", role_label: "RCB", x_pos: 62, y_pos: 74 },
    { slot_key: "RB", role_label: "RB", x_pos: 82, y_pos: 72 },

    { slot_key: "LM", role_label: "LM", x_pos: 18, y_pos: 48 },
    { slot_key: "LCM", role_label: "LCM", x_pos: 40, y_pos: 50 },
    { slot_key: "RCM", role_label: "RCM", x_pos: 60, y_pos: 50 },
    { slot_key: "RM", role_label: "RM", x_pos: 82, y_pos: 48 },

    { slot_key: "LS", role_label: "LS", x_pos: 38, y_pos: 22 },
    { slot_key: "RS", role_label: "RS", x_pos: 62, y_pos: 22 },
  ],
  "3-5-2": [
    { slot_key: "GK", role_label: "GK", x_pos: 50, y_pos: 90 },

    { slot_key: "LCB", role_label: "LCB", x_pos: 30, y_pos: 74 },
    { slot_key: "CB", role_label: "CB", x_pos: 50, y_pos: 76 },
    { slot_key: "RCB", role_label: "RCB", x_pos: 70, y_pos: 74 },

    { slot_key: "LWB", role_label: "LWB", x_pos: 12, y_pos: 48 },
    { slot_key: "LCM", role_label: "LCM", x_pos: 36, y_pos: 52 },
    { slot_key: "CM", role_label: "CM", x_pos: 50, y_pos: 46 },
    { slot_key: "RCM", role_label: "RCM", x_pos: 64, y_pos: 52 },
    { slot_key: "RWB", role_label: "RWB", x_pos: 88, y_pos: 48 },

    { slot_key: "LS", role_label: "LS", x_pos: 38, y_pos: 22 },
    { slot_key: "RS", role_label: "RS", x_pos: 62, y_pos: 22 },
  ],
};

function makeSlots(formation: string): Slot[] {
  return (FORMATIONS[formation] ?? FORMATIONS["4-3-3"]).map((slot) => ({
    ...slot,
    player_id: null,
  }));
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
    initialSlots.length > 0 ? initialSlots : makeSlots(initialFormation || "4-3-3")
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const playerMap = useMemo(
    () => Object.fromEntries(players.map((player) => [player.id, player])),
    [players]
  );

  function applyFormation(newFormation: string) {
    const base = makeSlots(newFormation);

    const merged = base.map((slot, index) => ({
      ...slot,
      player_id: slots[index]?.player_id ?? null,
    }));

    setFormation(newFormation);
    setSlots(merged);
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
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#183140] to-[#0b1820]">
            <div className="absolute inset-x-[12%] top-[6%] h-[18%] rounded-b-[999px] border-x border-b border-white/20" />
            <div className="absolute inset-x-[22%] top-[0%] h-[10%] rounded-b-[14px] border-x border-b border-white/20" />
            <div className="absolute left-1/2 top-[50%] h-[1px] w-full -translate-x-1/2 bg-white/15" />
            <div className="absolute left-1/2 top-[50%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
            <div className="absolute inset-x-[12%] bottom-[6%] h-[18%] rounded-t-[999px] border-x border-t border-white/20" />
            <div className="absolute inset-x-[22%] bottom-[0%] h-[10%] rounded-t-[14px] border-x border-t border-white/20" />

            {slots.map((slot) => {
              const player = slot.player_id ? playerMap[slot.player_id] : null;

              return (
                <div
                  key={slot.slot_key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const playerId = e.dataTransfer.getData("text/plain");
                    if (playerId) {
                      handleDrop(slot.slot_key, playerId);
                    }
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${slot.x_pos}%`,
                    top: `${slot.y_pos}%`,
                  }}
                >
                  <div className="flex w-[110px] flex-col items-center gap-1">
                    <button
                      type="button"
                      onDoubleClick={() => clearSlot(slot.slot_key)}
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white text-xs font-bold text-black shadow-md"
                      title={`${slot.role_label} — dubbelklicka för att rensa`}
                    >
                      {player?.shirt_number ?? slot.role_label}
                    </button>

                    <div className="text-center text-xs font-medium text-white">
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