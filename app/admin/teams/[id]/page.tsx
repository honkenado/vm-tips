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

    if (!res.ok) {
      throw new Error(data.error || "Kunde inte läsa lag");
    }

    const team = (data.teams ?? []).find((item: TeamApiRow) => item.id === teamId);

    if (!team) {
      throw new Error("Kunde inte hitta laget");
    }

    setForm(mapTeamToForm(team));
  }

  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true);
        setMessage(null);
        await reloadTeam(id);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Något gick fel när laget skulle hämtas"
        );
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [id]);

  async function handleAutofill() {
    if (!form) return;

    try {
      setAutoLoading(true);
      setMessage(null);

      const res = await fetch(`/api/admin/teams/${form.id}/autofill`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte hämta info automatiskt");
        return;
      }

      setForm((prev) =>
        prev
          ? {
              ...prev,
              confederation: data.updated?.confederation ?? prev.confederation,
              short_description:
                data.updated?.short_description ?? prev.short_description,
              source: data.updated?.source ?? prev.source,
            }
          : prev
      );

      setMessage(
        `Laginfo hämtad automatiskt.${data.debug ? ` (${data.debug.teamName})` : ""}`
      );
    } catch {
      setMessage("Något gick fel vid automatisk hämtning");
    } finally {
      setAutoLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form) return;

    try {
      setSaving(true);
      setMessage(null);

      const res = await fetch(`/api/admin/teams/${form.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          group_letter: form.group_letter.trim().toUpperCase(),
          fifa_rank: form.fifa_rank ? Number(form.fifa_rank) : null,
          coach: form.coach.trim() || null,
          confederation: form.confederation.trim() || null,
          short_description: form.short_description.trim() || null,
          qualification_summary: form.qualification_summary.trim() || null,
          squad_status: form.squad_status.trim() || null,
          source: form.source.trim() || null,
          formation: form.formation.trim() || null,
          key_players: form.key_players
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte spara laget");
        return;
      }

      router.push("/admin/teams");
      router.refresh();
    } catch {
      setMessage("Något gick fel när laget skulle sparas");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-white">Laddar lag...</div>;
  }

  if (!form) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
        {message || "Laget kunde inte laddas."}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Redigera lag</h1>
        <p className="text-sm text-gray-400">{form.name}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-gray-300 bg-white p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lagnamn">
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </Field>

          <Field label="Slug">
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              required
            />
          </Field>

          <Field label="Grupp">
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              value={form.group_letter}
              onChange={(e) => updateField("group_letter", e.target.value)}
              maxLength={1}
              required
            />
          </Field>

          <Field label="FIFA-ranking">
            <input
              type="number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              value={form.fifa_rank}
              onChange={(e) => updateField("fifa_rank", e.target.value)}
            />
          </Field>

          <Field label="Tränare">
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              value={form.coach}
              onChange={(e) => updateField("coach", e.target.value)}
            />
          </Field>

          <Field label="Förbund">
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              value={form.confederation}
              onChange={(e) => updateField("confederation", e.target.value)}
            />
          </Field>

          <Field label="Formation">
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              placeholder="t.ex. 4-3-3"
              value={form.formation}
              onChange={(e) => updateField("formation", e.target.value)}
            />
          </Field>

          <Field label="Nyckelspelare (kommaseparerat)">
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
              placeholder="Player 1, Player 2"
              value={form.key_players}
              onChange={(e) => updateField("key_players", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Kort beskrivning">
          <textarea
            className="min-h-[100px] w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
            value={form.short_description}
            onChange={(e) => updateField("short_description", e.target.value)}
          />
        </Field>

        <Field label="Vägen till VM / kvalsammanfattning">
          <textarea
            className="min-h-[130px] w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
            value={form.qualification_summary}
            onChange={(e) => updateField("qualification_summary", e.target.value)}
          />
        </Field>

        <Field label="Truppstatus">
          <textarea
            className="min-h-[100px] w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
            value={form.squad_status}
            onChange={(e) => updateField("squad_status", e.target.value)}
          />
        </Field>

        <Field label="Källa">
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
            value={form.source}
            onChange={(e) => updateField("source", e.target.value)}
          />
        </Field>

        {message && (
          <div className="rounded-lg bg-green-100 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={handleAutofill}
            disabled={autoLoading}
            className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {autoLoading ? "Hämtar..." : "Hämta info automatiskt"}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-black px-4 py-2 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Sparar..." : "Spara ändringar"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/admin/players/${form.id}`)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium text-black transition hover:bg-gray-100"
          >
            Hantera spelare
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/teams")}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium text-black transition hover:bg-gray-100"
          >
            Avbryt
          </button>
        </div>
      </form>
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