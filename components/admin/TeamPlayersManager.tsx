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

  async function addPlayer() {
    const res = await fetch("/api/admin/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ team_id: teamId, name, position, club }),
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
  }

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl">
      <h2 className="text-xl font-bold text-black">Lägg till spelare</h2>

      <input
        placeholder="Namn"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 text-black"
      />

      <input
        placeholder="Position"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        className="w-full border p-2 text-black"
      />

      <input
        placeholder="Klubb"
        value={club}
        onChange={(e) => setClub(e.target.value)}
        className="w-full border p-2 text-black"
      />

      <button
        onClick={addPlayer}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Lägg till
      </button>

      {message && <div className="text-black">{message}</div>}
    </div>
  );
}