"use client";

import { useState } from "react";

type Player = {
  id: string;
  team_id: string;
  name: string;
  position: string;
  club: string | null;
  age: number | null;
  caps: number | null;
  goals: number | null;
  shirt_number: number | null;
  is_key_player: boolean | null;
  is_injured: boolean | null;
  player_order: number | null;
};

type PlayerForm = {
  name: string;
  position: string;
  club: string;
  age: string;
  caps: string;
  goals: string;
  shirt_number: string;
  is_key_player: boolean;
  is_injured: boolean;
  player_order: string;
};

const emptyForm: PlayerForm = {
  name: "",
  position: "",
  club: "",
  age: "",
  caps: "",
  goals: "",
  shirt_number: "",
  is_key_player: false,
  is_injured: false,
  player_order: "",
};

export default function TeamPlayersManager({
  teamId,
  initialPlayers,
}: {
  teamId: string;
  initialPlayers: Player[];
}) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [form, setForm] = useState<PlayerForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  function updateField(name: keyof PlayerForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function startEdit(player: Player) {
    setEditingId(player.id);
    setForm({
      name: player.name ?? "",
      position: player.position ?? "",
      club: player.club ?? "",
      age: player.age?.toString() ?? "",
      caps: player.caps?.toString() ?? "",
      goals: player.goals?.toString() ?? "",
      shirt_number: player.shirt_number?.toString() ?? "",
      is_key_player: !!player.is_key_player,
      is_injured: !!player.is_injured,
      player_order: player.player_order?.toString() ?? "",
    });
    setMessage(null);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      team_id: teamId,
      name: form.name.trim(),
      position: form.position.trim(),
      club: form.club.trim() || null,
      age: form.age ? Number(form.age) : null,
      caps: form.caps ? Number(form.caps) : 0,
      goals: form.goals ? Number(form.goals) : 0,
      shirt_number: form.shirt_number ? Number(form.shirt_number) : null,
      is_key_player: form.is_key_player,
      is_injured: form.is_injured,
      player_order: form.player_order ? Number(form.player_order) : 999,
    };

    try {
      const res = await fetch(
        editingId ? `/api/admin/players/${editingId}` : "/api/admin/players",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte spara spelaren");
        return;
      }

      if (editingId) {
        setPlayers((prev) =>
          prev.map((player) => (player.id === editingId ? data.player : player))
        );
        setMessage("Spelaren uppdaterades.");
      } else {
        setPlayers((prev) =>
          [...prev, data.player].sort(
            (a, b) => (a.player_order ?? 999) - (b.player_order ?? 999)
          )
        );
        setMessage("Spelaren lades till.");
      }

      resetForm();
    } catch {
      setMessage("Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  async function deletePlayer(id: string) {
    const confirmed = window.confirm("Ta bort spelaren?");
    if (!confirmed) return;

    setMessage(null);

    const res = await fetch(`/api/admin/players/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Kunde inte ta bort spelaren");
      return;
    }

    setPlayers((prev) => prev.filter((player) => player.id !== id));

    if (editingId === id) {
      resetForm();
    }

    setMessage("Spelaren togs bort.");
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-gray-300 bg-white p-6"
      >
        <div>
          <h2 className="text-xl font-bold text-black">
            {editingId ? "Redigera spelare" : "Lägg till spelare"}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Namn">
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </Field>

          <Field label="Position">
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              placeholder="GK / DF / MF / FW"
              value={form.position}
              onChange={(e) => updateField("position", e.target.value)}
              required
            />
          </Field>

          <Field label="Klubb">
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              value={form.club}
              onChange={(e) => updateField("club", e.target.value)}
            />
          </Field>

          <Field label="Ålder">
            <input
              type="number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              value={form.age}
              onChange={(e) => updateField("age", e.target.value)}
            />
          </Field>

          <Field label="Caps">
            <input
              type="number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              value={form.caps}
              onChange={(e) => updateField("caps", e.target.value)}
            />
          </Field>

          <Field label="Mål">
            <input
              type="number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              value={form.goals}
              onChange={(e) => updateField("goals", e.target.value)}
            />
          </Field>

          <Field label="Tröjnummer">
            <input
              type="number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              value={form.shirt_number}
              onChange={(e) => updateField("shirt_number", e.target.value)}
            />
          </Field>

          <Field label="Sortering">
            <input
              type="number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              value={form.player_order}
              onChange={(e) => updateField("player_order", e.target.value)}
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-black">
            <input
              type="checkbox"
              checked={form.is_key_player}
              onChange={(e) => updateField("is_key_player", e.target.checked)}
            />
            Nyckelspelare
          </label>

          <label className="flex items-center gap-2 text-black">
            <input
              type="checkbox"
              checked={form.is_injured}
              onChange={(e) => updateField("is_injured", e.target.checked)}
            />
            Skadad
          </label>
        </div>

        {message && (
          <div className="rounded-lg bg-gray-100 p-3 text-sm text-black">
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-black px-4 py-2 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading
              ? "Sparar..."
              : editingId
              ? "Spara spelare"
              : "Lägg till spelare"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium text-black transition hover:bg-gray-100"
            >
              Avbryt redigering
            </button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-bold text-black">Spelarlista</h2>
        </div>

        {players.length === 0 ? (
          <div className="p-6 text-gray-600">Inga spelare ännu.</div>
        ) : (
          <div className="divide-y">
            {players
              .sort((a, b) => (a.player_order ?? 999) - (b.player_order ?? 999))
              .map((player) => (
                <div
                  key={player.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-semibold text-black">
                      {player.name}
                      {player.shirt_number ? ` #${player.shirt_number}` : ""}
                    </div>
                    <div className="text-sm text-gray-700">
                      {player.position} • {player.club ?? "Ingen klubb"} •{" "}
                      {player.caps ?? 0} landskamper • {player.goals ?? 0} mål
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      {player.is_key_player ? (
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-yellow-800">
                          Nyckelspelare
                        </span>
                      ) : null}
                      {player.is_injured ? (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">
                          Skadad
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(player)}
                      className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm font-medium text-black transition hover:bg-gray-200"
                    >
                      Redigera
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePlayer(player.id)}
                      className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-black">{label}</span>
      {children}
    </label>
  );
}