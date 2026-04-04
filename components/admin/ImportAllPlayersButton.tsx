"use client";

import { useState } from "react";

type ImportResult = {
  ok: boolean;
  teamId: string;
  teamName: string;
  count: number;
  error?: string;
};

export default function ImportAllPlayersButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<ImportResult[]>([]);

  async function handleImportAll() {
    const confirmed = window.confirm(
      "Detta uppdaterar spelare för alla lag med wikipedia_title. Fortsätta?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setMessage("");
      setResults([]);

      const res = await fetch("/api/admin/players/import-all", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte uppdatera alla lag");
        return;
      }

      setMessage(
        `Klart. ${data.successCount} lag uppdaterade, ${data.failCount} fel, totalt ${data.importedPlayers} spelare importerade.`
      );
      setResults(data.results ?? []);
    } catch {
      setMessage("Något gick fel vid massimport");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-black">Massuppdatera lag</h2>
          <p className="text-sm text-gray-600">
            Hämtar om spelartrupper från Wikipedia för alla lag som har
            wikipedia_title.
          </p>
        </div>

        <button
          type="button"
          onClick={handleImportAll}
          disabled={loading}
          className="rounded-xl bg-black px-4 py-2 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Uppdaterar alla lag..." : "Uppdatera alla lag"}
        </button>
      </div>

      {message ? (
        <div className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-black">
          {message}
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-4 space-y-2">
          {results.map((result) => (
            <div
              key={result.teamId}
              className={`rounded-lg border p-3 text-sm ${
                result.ok
                  ? "border-green-200 bg-green-50 text-green-900"
                  : "border-red-200 bg-red-50 text-red-900"
              }`}
            >
              <span className="font-semibold">{result.teamName}</span>
              {result.ok
                ? ` — OK (${result.count} spelare)`
                : ` — Fel: ${result.error ?? "Okänt fel"}`}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}