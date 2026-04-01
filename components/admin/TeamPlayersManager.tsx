"use client";

import { useEffect, useState } from "react";

type Player = {
  id: string;
  team_id: string;
  name: string;
  position: string;
  club: string | null;
};

export default function TeamPlayersManager({
  teamId,
}: {
  teamId: string;
}) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [club, setClub] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadPlayersDirect() {
    const res = await fetch(`/api/admin/players-list?teamId=${teamId}`, {
      cache: "no-store",
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Kunde inte läsa spelare");
      return;
    }

    setPlayers(data.players ?? []);
  }

  useEffect(() => {
    loadPlayersDirect();
  }, [teamId]);

  function resetForm() {
    setName("");
    setPosition("");
    setClub("");
    setEditingId(null);
  }

  function startEdit(player: Player) {
    setEditingId(player.id);
    setName(player.name ?? "");
    setPosition(player.position ?? "");
    setClub(player.club ?? "");
    setMessage("");
  }

  async function addOrUpdatePlayer() {
    try {
      setLoading(true);
      setMessage("");

      const url = editingId
        ? `/api/admin/players/${editingId}`
        : "/api/admin/players";

      const method = editingId ? "PATCH" : "POST";

      const body = editingId
        ? {
            name,
            position,
            club,
          }
        : {
            team_id: teamId,
            name,
            position,
            club,
          };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Fel");
        return;
      }

      setMessage(editingId ? "Spelare uppdaterad" : "Spelare tillagd");
      resetForm();
      loadPlayersDirect();
    } catch {
      setMessage("Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  async function deletePlayer(id: string) {
    const confirmed = window.confirm("Vill du ta bort spelaren?");
    if (!confirmed) return;

    try {
      setMessage("");

      const res = await fetch(`/api/admin/players/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte ta bort spelaren");
        return;
      }

      if (editingId === id) {
        resetForm();
      }

      setMessage("Spelare borttagen");
      loadPlayersDirect();
    } catch {
      setMessage("Något gick fel när spelaren skulle tas bort");
    }
  }

  async function generatePlayers() {
    try {
      setAiLoading(true);
      setMessage("");

      const res = await fetch(`/api/admin/teams/${teamId}/ai-players`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte generera trupp");
        return;
      }

      setMessage(`Spelare genererade: ${data.count}`);
      loadPlayersDirect();
    } catch {
      setMessage("Något gick fel vid AI-generering");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={generatePlayers}
            disabled={aiLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {aiLoading ? "Genererar..." : "Generera trupp (AI)"}
          </button>
        </div>

        <h2 className="text-xl font-bold text-black">
          {editingId ? "Redigera spelare" : "Lägg till spelare"}
        </h2>

        <input
          placeholder="Namn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border p-2 text-black"
        />

        <input
          placeholder="Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full rounded border p-2 text-black"
        />

        <input
          placeholder="Klubb"
          value={club}
          onChange={(e) => setClub(e.target.value)}
          className="w-full rounded border p-2 text-black"
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addOrUpdatePlayer}
            disabled={loading}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading
              ? "Sparar..."
              : editingId
              ? "Spara ändringar"
              : "Lägg till"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-black hover:bg-gray-100"
            >
              Avbryt
            </button>
          )}
        </div>

        {message && <div className="text-black">{message}</div>}
      </div>

      <div className="rounded-xl bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-black">Spelarlista</h2>

        {players.length === 0 ? (
          <p className="text-gray-600">Inga spelare ännu.</p>
        ) : (
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-semibold text-black">{player.name}</div>
                  <div className="text-sm text-gray-700">
                    {player.position} • {player.club || "Ingen klubb"}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(player)}
                    className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-200"
                  >
                    Redigera
                  </button>

                  <button
                    type="button"
                    onClick={() => deletePlayer(player.id)}
                    className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Ta bort
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}