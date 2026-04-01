"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTeamPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    group_letter: "",
    fifa_rank: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function updateField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          group_letter: form.group_letter.toUpperCase(),
          fifa_rank: form.fifa_rank ? Number(form.fifa_rank) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Något gick fel");
        return;
      }

      // ✅ Redirect tillbaka till listan
      router.push("/admin/teams");
      router.refresh();
    } catch {
      setMessage("Kunde inte skapa lag");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Nytt lag</h1>
        <p className="text-sm text-gray-400">
          Lägg till ett nytt landslag
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-gray-300 bg-white p-6"
      >
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Lagnamn
          </label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Slug (URL)
          </label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
            placeholder="t.ex. sverige"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Grupp
          </label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
            placeholder="A"
            maxLength={1}
            value={form.group_letter}
            onChange={(e) => updateField("group_letter", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            FIFA-ranking
          </label>
          <input
            type="number"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
            value={form.fifa_rank}
            onChange={(e) => updateField("fifa_rank", e.target.value)}
          />
        </div>

        {message && (
          <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-2 text-white font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Sparar..." : "Skapa lag"}
        </button>
      </form>
    </div>
  );
}