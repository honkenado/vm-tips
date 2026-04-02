"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type TeamFormState = {
  id: string;
  name: string;
  slug: string;
  group_letter: string;
  fifa_rank: string;
  coach: string;
  confederation: string;
  short_description: string;
  qualification_summary: string;
  squad_status: string;
  source: string;
  formation: string;
  key_players: string;
};

type TeamApiRow = {
  id: string;
  name: string | null;
  slug: string | null;
  group_letter: string | null;
  fifa_rank: number | null;
  coach: string | null;
  confederation: string | null;
  short_description: string | null;
  qualification_summary: string | null;
  squad_status: string | null;
  source: string | null;
  formation: string | null;
  key_players: string[] | null;
};

export default function EditTeamPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [form, setForm] = useState<TeamFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function updateField(name: keyof TeamFormState, value: string) {
    setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  }

  function mapTeamToForm(team: TeamApiRow): TeamFormState {
    return {
      id: team.id,
      name: team.name ?? "",
      slug: team.slug ?? "",
      group_letter: team.group_letter ?? "",
      fifa_rank: team.fifa_rank?.toString() ?? "",
      coach: team.coach ?? "",
      confederation: team.confederation ?? "",
      short_description: team.short_description ?? "",
      qualification_summary: team.qualification_summary ?? "",
      squad_status: team.squad_status ?? "",
      source: team.source ?? "",
      formation: team.formation ?? "",
      key_players: Array.isArray(team.key_players)
        ? team.key_players.join(", ")
        : "",
    };
  }

  async function reloadTeam(teamId: string) {
    const res = await fetch("/api/admin/teams", { cache: "no-store" });
    const data = await res.json();

    const team = (data.teams ?? []).find(
      (item: TeamApiRow) => item.id === teamId
    );

    setForm(mapTeamToForm(team));
  }

  useEffect(() => {
    reloadTeam(id).finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form) return;

    setSaving(true);
    setMessage(null);

    const res = await fetch(`/api/admin/teams/${form.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        fifa_rank: form.fifa_rank ? Number(form.fifa_rank) : null,
        key_players: form.key_players
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(`Fel: ${data.error}`);
      setSaving(false);
      return;
    }

    setMessage("Sparat!");
    await reloadTeam(form.id);
    setSaving(false);
  }

  async function handleAutofill() {
    if (!form) return;

    setAutoLoading(true);

    const res = await fetch(`/api/admin/teams/${form.id}/autofill`, {
      method: "POST",
    });

    const data = await res.json();

    if (res.ok) {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              short_description:
                data.updated?.short_description ?? prev.short_description,
              confederation:
                data.updated?.confederation ?? prev.confederation,
            }
          : prev
      );

      setMessage("AI fyllde info");
    }

    setAutoLoading(false);
  }

  if (loading || !form) return <div className="text-white">Laddar...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{form.name}</h1>
          <p className="text-gray-400">Redigera lag</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAutofill}
            className="bg-blue-600 text-white px-3 py-2 rounded"
          >
            AI fyll
          </button>

          <button
            onClick={() => router.push(`/admin/players/${form.id}`)}
            className="bg-white px-3 py-2 rounded"
          >
            Spelare
          </button>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded space-y-4">
        <input
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Lag"
          className="w-full border p-2"
        />

        <input
          value={form.coach}
          onChange={(e) => updateField("coach", e.target.value)}
          placeholder="Tränare"
          className="w-full border p-2"
        />

        <input
          value={form.formation}
          onChange={(e) => updateField("formation", e.target.value)}
          placeholder="Formation"
          className="w-full border p-2"
        />

        <textarea
          value={form.short_description}
          onChange={(e) =>
            updateField("short_description", e.target.value)
          }
          placeholder="Beskrivning"
          className="w-full border p-2"
        />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          {saving ? "Sparar..." : "Spara"}
        </button>

        {message && <div className="text-black">{message}</div>}
      </form>
    </div>
  );
}