"use client";

import { useEffect, useState } from "react";

type LeaderboardEntry = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  has_prediction: boolean;
  updated_at: string | null;
};

export default function LeaderboardSection() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const res = await fetch("/api/leaderboard");
        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || "Kunde inte hämta leaderboard");
          return;
        }

        setEntries(data.leaderboard ?? []);
      } catch (error) {
        console.error("Fel vid hämtning av leaderboard", error);
        setErrorMessage("Kunde inte hämta leaderboard");
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  function formatName(entry: LeaderboardEntry) {
    const fullName = `${entry.first_name ?? ""} ${entry.last_name ?? ""}`.trim();
    return fullName || "Namn saknas";
  }

  function formatUpdatedAt(value: string | null) {
    if (!value) return "Ej inlämnat";

    return new Date(value).toLocaleString("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black text-slate-900 md:text-2xl">Leaderboard</h2>
        <p className="mt-3 text-sm text-slate-600">Laddar deltagare...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black text-slate-900 md:text-2xl">Leaderboard</h2>
        <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 md:text-2xl">Leaderboard</h2>
          <p className="mt-1 text-sm text-slate-600">
            Visar vilka som har lämnat in sitt tips.
          </p>
        </div>

        <div className="inline-flex w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
          {entries.length} deltagare
        </div>
      </div>

      {/* Mobilvy */}
      <div className="space-y-3 md:hidden">
        {entries.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Inga deltagare hittades ännu.
          </div>
        )}

        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  Plats #{index + 1}
                </div>
                <div className="mt-1 text-base font-black text-slate-900">
                  {formatName(entry)}
                </div>
                {entry.role === "superadmin" && (
                  <div className="mt-1 text-xs font-bold text-indigo-600">Admin</div>
                )}
              </div>

              {entry.has_prediction ? (
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
                  Inlämnat
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">
                  Ej klart
                </span>
              )}
            </div>

            <div className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-700">Senast sparat:</span>{" "}
              {formatUpdatedAt(entry.updated_at)}
            </div>
          </div>
        ))}
      </div>

      {/* Desktopvy */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
        <div className="grid grid-cols-[72px_minmax(0,1.4fr)_minmax(0,1fr)_150px] bg-slate-100 px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-600">
          <div>Plats</div>
          <div>Namn</div>
          <div>Senast sparat</div>
          <div>Status</div>
        </div>

        <div className="divide-y divide-slate-200">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className="grid grid-cols-[72px_minmax(0,1.4fr)_minmax(0,1fr)_150px] items-center px-4 py-4"
            >
              <div className="text-lg font-black text-slate-900">{index + 1}</div>

              <div className="min-w-0">
                <div className="truncate text-base font-bold text-slate-900">
                  {formatName(entry)}
                </div>

                {entry.role === "superadmin" && (
                  <div className="text-xs font-bold text-indigo-600">Admin</div>
                )}
              </div>

              <div className="text-sm text-slate-600">
                {formatUpdatedAt(entry.updated_at)}
              </div>

              <div>
                {entry.has_prediction ? (
                  <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
                    Inlämnat
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">
                    Ej klart
                  </span>
                )}
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="px-4 py-8 text-sm text-slate-500">
              Inga deltagare hittades ännu.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}