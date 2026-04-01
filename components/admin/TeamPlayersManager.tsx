"use client";

import { useState } from "react";

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

  async function addPlayer() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team_id: teamId,
          name,
          position,
          club,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Fel");
        return;
      }

      setMessage("Spelare tillagd");
      setName("");
      setPosition("");
      setClub("");
    } catch {
      setMessage("Något gick fel");
    } finally {
      setLoading(false);
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
      window.location.reload();
    } catch {
      setMessage("Något gick fel vid AI-generering");
    } finally {
      setAiLoading(false);
    }
  }

  return (
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

      <h2 className="text-xl font-bold text-black">Lägg till spelare</h2>

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

      <button
        type="button"
        onClick={addPlayer}
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Sparar..." : "Lägg till"}
      </button>

      {message && <div className="text-black">{message}</div>}
    </div>
  );
}