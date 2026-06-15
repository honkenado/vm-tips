"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Match = {
  id: number;
  matchNumber?: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: string;
  awayGoals: string;
};

type GroupData = {
  name: string;
  teams: string[];
  matches: Match[];
};

type AddesTipsResponse = {
  profile: {
    name: string;
    username: string;
  };
  prediction: {
    groupStage: GroupData[];
    knockout: Record<string, string>;
    goldenBoot: string;
    updatedAt: string | null;
  };
  error?: string;
};

export default function AddesTipsPage() {
  const [data, setData] = useState<AddesTipsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadAddesTips() {
      try {
        setLoading(true);

        const res = await fetch("/api/public/addes-tips", {
          cache: "no-store",
        });

        const json = (await res.json()) as AddesTipsResponse;

        if (!res.ok) {
          setErrorMessage(json.error || "Kunde inte hämta Addes tips");
          return;
        }

        setData(json);
      } catch (error) {
        console.error(error);
        setErrorMessage("Något gick fel");
      } finally {
        setLoading(false);
      }
    }

    loadAddesTips();
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
          <Link
            href="/"
            className="inline-flex rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/80 hover:bg-white/[0.1]"
          >
            ← Till startsidan
          </Link>

          <div className="mt-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
              Offentligt låst tips
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
              🏆 Addes VM-tips
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              Här visas tävlingsledarens kompletta tips för transparens.
              Tipset är hämtat direkt från databasen.
            </p>

            {data?.prediction.updatedAt ? (
              <p className="mt-3 text-sm font-semibold text-white/45">
                Senast sparat:{" "}
                {new Date(data.prediction.updatedAt).toLocaleString("sv-SE")}
              </p>
            ) : null}
          </div>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            Laddar Addes tips...
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-red-100">
            {errorMessage}
          </div>
        ) : data ? (
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-emerald-400/15 bg-emerald-500/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                Skyttekung
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {data.prediction.goldenBoot}
              </p>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-2xl font-black">Gruppspel</h2>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {data.prediction.groupStage.map((group) => (
                  <div
                    key={group.name}
                    className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4"
                  >
                    <h3 className="text-xl font-black text-emerald-300">
                      {group.name}
                    </h3>

                    <div className="mt-4 space-y-2">
                      {group.matches.map((match) => (
                        <div
                          key={`${group.name}-${match.id}-${match.homeTeam}-${match.awayTeam}`}
                          className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                        >
                          <span className="truncate text-right font-bold">
                            {match.homeTeam}
                          </span>

                          <span className="rounded-lg bg-white/[0.08] px-3 py-1 font-black text-white">
                            {match.homeGoals || "–"}–{match.awayGoals || "–"}
                          </span>

                          <span className="truncate font-bold">
                            {match.awayTeam}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-2xl font-black">Slutspel</h2>

              {Object.keys(data.prediction.knockout).length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {Object.entries(data.prediction.knockout).map(
                    ([matchId, winner]) => (
                      <div
                        key={matchId}
                        className="rounded-xl border border-white/10 bg-black/25 p-4"
                      >
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                          {matchId}
                        </p>
                        <p className="mt-1 text-lg font-black text-white">
                          {winner || "Ej valt"}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm font-semibold text-white/55">
                  Inga slutspelsval hittades.
                </p>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}