"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type League = {
  id: string;
  name: string;
  join_code: string;
  created_by: string | null;
  created_at: string | null;
};

type MyLeaguesResponse = {
  leagues?: League[];
  error?: string;
};

export default function LeagueHubPage() {
  const router = useRouter();

  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);

  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  async function loadMyLeagues() {
    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch("/api/leagues/my", {
        cache: "no-store",
      });

      const data: MyLeaguesResponse = await res.json();

      if (!res.ok) {
        setMyLeagues([]);
        setErrorMessage(data.error || "Kunde inte hämta ligor");
        return;
      }

      const leagues = Array.isArray(data.leagues) ? data.leagues : [];

      const filteredLeagues = leagues.filter(
        (league) => league.id !== "main" && league.join_code !== "MAIN"
      );

      setMyLeagues(filteredLeagues);
    } catch (error) {
      console.error("Fel vid hämtning av ligor", error);
      setMyLeagues([]);
      setErrorMessage("Kunde inte hämta ligor");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyLeagues();
  }, []);

  async function handleCreateLeague() {
    const trimmedName = createName.trim();
    if (!trimmedName) {
      setActionMessage("Skriv ett namn på ligan först.");
      return;
    }

    try {
      setCreating(true);
      setActionMessage(null);

      const res = await fetch("/api/leagues/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionMessage(data.error || "Kunde inte skapa ligan");
        return;
      }

      await loadMyLeagues();

      const leagueId = data.league?.id;
      const createdJoinCode = data.league?.join_code;

      setCreateName("");
      setActionMessage(
        createdJoinCode
          ? `Liga skapad! Kod: ${createdJoinCode}`
          : "Liga skapad!"
      );

      if (leagueId) {
        router.push(`/league/${leagueId}`);
        return;
      }

      if (createdJoinCode) {
        router.push(`/league/${createdJoinCode}`);
      }
    } catch (error) {
      console.error("Fel vid skapande av liga", error);
      setActionMessage("Något gick fel när ligan skulle skapas");
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinLeague() {
    const trimmedCode = joinCode.trim();
    if (!trimmedCode) {
      setActionMessage("Skriv in en ligakod först.");
      return;
    }

    try {
      setJoining(true);
      setActionMessage(null);

      const res = await fetch("/api/leagues/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ joinCode: trimmedCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionMessage(data.error || "Kunde inte gå med i ligan");
        return;
      }

      await loadMyLeagues();

      const leagueId = data.league?.id;
      const nextCode = data.league?.join_code || trimmedCode.toUpperCase();

      setJoinCode("");
      setActionMessage(`Du gick med i ligan: ${data.league?.name || nextCode}`);

      if (leagueId) {
        router.push(`/league/${leagueId}`);
        return;
      }

      router.push(`/league/${nextCode}`);
    } catch (error) {
      console.error("Fel vid join league", error);
      setActionMessage("Något gick fel när du skulle gå med i ligan");
    } finally {
      setJoining(false);
    }
  }

  return (
    <main className="min-h-screen px-3 py-4 sm:px-4 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.1]"
          >
            ← Till startsidan
          </button>
        </div>

        <section className="card-premium-strong mb-4 p-5 sm:p-6">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-400">
                Addes VM-tips
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Ligor
              </h1>
              <p className="text-muted-premium mt-2 max-w-2xl text-sm leading-6">
                Här hittar du huvudligan och dina kompisligor. Du kan också skapa
                en egen liga eller gå med via ligakod.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                <label
                  htmlFor="create-league-name"
                  className="mb-2 block text-sm font-bold text-white"
                >
                  Skapa ny liga
                </label>
                <input
                  id="create-league-name"
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Skriv ligans namn"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateLeague}
                  disabled={creating}
                  className="btn-primary-premium mt-3 w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? "Skapar..." : "Skapa liga"}
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                <label
                  htmlFor="join-league-code"
                  className="mb-2 block text-sm font-bold text-white"
                >
                  Gå med i liga
                </label>
                <input
                  id="join-league-code"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Ange ligakod"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleJoinLeague}
                  disabled={joining}
                  className="btn-secondary-premium mt-3 w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {joining ? "Ansluter..." : "Gå med i liga"}
                </button>
              </div>
            </div>

            {actionMessage ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80">
                {actionMessage}
              </div>
            ) : null}
          </div>
        </section>

        <section className="card-premium mb-4 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-white">Huvudligan</h2>
              <p className="text-muted-premium mt-1 text-sm">
                Den officiella stora ligan där alla aktiva deltagare jämförs.
              </p>
            </div>

            <Link
              href="/league/main"
              className="btn-secondary-premium px-4 py-2 text-sm"
            >
              Öppna
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
            <div className="text-base font-bold text-white">Huvudligan</div>
            <div className="text-muted-premium mt-1 text-sm">
              Alla poäng räknas mot den officiella tabellen.
            </div>
          </div>
        </section>

        <section className="card-premium p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-black text-white">Mina ligor</h2>
            <p className="text-muted-premium mt-1 text-sm">
              Här ser du ligor du redan är med i.
            </p>
          </div>

          {loading ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-5 text-sm text-white/70">
              Laddar ligor...
            </div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-5 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : myLeagues.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-5 text-sm text-white/70">
              Du är inte med i någon kompisliga ännu.
            </div>
          ) : (
            <div className="grid gap-3">
              {myLeagues.map((league) => (
                <Link
                  key={league.id}
                  href={`/league/${league.join_code}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-base font-black text-white">
                      {league.name}
                    </div>
                    <div className="text-muted-premium mt-1 text-sm">
                      Kod: <span className="font-bold text-white">{league.join_code}</span>
                    </div>
                  </div>

                  <span className="ml-4 rounded-full border border-emerald-400/20 bg-emerald-500/12 px-3 py-1 text-xs font-bold text-emerald-200">
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