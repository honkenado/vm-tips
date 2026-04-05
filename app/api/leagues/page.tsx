"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type League = {
  id: string;
  name: string;
  join_code: string;
  created_by: string;
  created_at: string;
};

type MyLeaguesResponse = {
  leagues?: League[];
  error?: string;
};

export default function LeagueHubPage() {
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);

  async function loadMyLeagues() {
    try {
      setErrorMessage(null);

      const res = await fetch("/api/leagues/my", {
        cache: "no-store",
      });

      const data: MyLeaguesResponse = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Kunde inte hämta ligor");
        return;
      }

      setMyLeagues((data.leagues ?? []) as League[]);
    } catch (error) {
      console.error("Fel vid hämtning av ligor", error);
      setErrorMessage("Kunde inte hämta ligor");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyLeagues();
  }, []);

  async function handleCreateLeague() {
    const name = prompt("Vad ska ligan heta?");
    if (!name) return;

    try {
      setCreating(true);

      const res = await fetch("/api/leagues/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Kunde inte skapa ligan");
        return;
      }

      await loadMyLeagues();

      const joinCode = data.league?.join_code;
      if (joinCode) {
        alert(`Liga skapad! Kod: ${joinCode}`);
        window.location.href = `/league/${joinCode}`;
      } else {
        alert("Liga skapad");
      }
    } catch (error) {
      console.error("Fel vid skapande av liga", error);
      alert("Något gick fel när ligan skulle skapas");
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinLeague() {
    const joinCode = prompt("Ange ligakod");
    if (!joinCode) return;

    try {
      setJoining(true);

      const res = await fetch("/api/leagues/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ joinCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Kunde inte gå med i ligan");
        return;
      }

      await loadMyLeagues();

      const nextCode = data.league?.join_code || joinCode.toUpperCase();
      alert(`Du gick med i ligan: ${data.league?.name || nextCode}`);
      window.location.href = `/league/${nextCode}`;
    } catch (error) {
      console.error("Fel vid join league", error);
      alert("Något gick fel när du skulle gå med i ligan");
    } finally {
      setJoining(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eef2ff_28%,_#f8fafc_58%,_#e2e8f0_100%)] px-3 py-4 sm:px-4 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl">
        <section className="mb-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">
                Addes VM-tips
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Ligor
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Här hittar du huvudligan och dina kompisligor. Du kan också skapa
                en egen liga eller gå med via ligakod.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCreateLeague}
                disabled={creating}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Skapar..." : "Skapa liga"}
              </button>

              <button
                type="button"
                onClick={handleJoinLeague}
                disabled={joining}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {joining ? "Ansluter..." : "Gå med i liga"}
              </button>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">Huvudligan</h2>
              <p className="mt-1 text-sm text-slate-600">
                Den officiella stora ligan där alla aktiva deltagare jämförs.
              </p>
            </div>

            <Link
              href="/league/main"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Öppna
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-base font-bold text-slate-900">Huvudligan</div>
            <div className="mt-1 text-sm text-slate-500">
              Alla poäng räknas mot den officiella tabellen.
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-900">Mina ligor</h2>
            <p className="mt-1 text-sm text-slate-600">
              Här ser du ligor du redan är med i.
            </p>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Laddar ligor...
            </div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-600">
              {errorMessage}
            </div>
          ) : myLeagues.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Du är inte med i någon kompisliga ännu.
            </div>
          ) : (
            <div className="grid gap-3">
              {myLeagues.map((league) => (
                <Link
                  key={league.id}
                  href={`/league/${league.join_code}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate text-base font-black text-slate-900">
                      {league.name}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Kod: <span className="font-bold">{league.join_code}</span>
                    </div>
                  </div>

                  <span className="ml-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    Öppna
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}