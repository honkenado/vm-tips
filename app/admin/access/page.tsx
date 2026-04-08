"use client";

import { useEffect, useMemo, useState } from "react";

type ProfileRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  role: string | null;
  payment_status: string | null;
  prediction_unlock_until: string | null;
};

type InviteRow = {
  id: string;
  email: string;
  unlock_until: string;
  note: string | null;
  created_at: string;
};

function formatName(profile: ProfileRow) {
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  return fullName || profile.username || profile.email || "Okänd användare";
}

function formatDateTime(value: string | null) {
  if (!value) return "Ingen aktiv upplåsning";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Ogiltigt datum";
  return date.toLocaleString("sv-SE");
}

export default function AdminAccessPage() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [busyInviteId, setBusyInviteId] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteHours, setInviteHours] = useState("2");
  const [inviteNote, setInviteNote] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch("/api/admin/access");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte läsa åtkomstdata");
        return;
      }

      setProfiles(data.profiles ?? []);
      setInvites(data.invites ?? []);
    } catch (error) {
      console.error(error);
      setMessage("Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function setPredictionUnlock(userId: string, hours: number) {
    try {
      setBusyUserId(userId);
      setMessage(null);

      const res = await fetch("/api/admin/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "set_prediction_unlock",
          userId,
          hours,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte låsa upp tipset");
        return;
      }

      setMessage(`Tipset öppnades i ${hours} tim för deltagaren.`);
      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Något gick fel");
    } finally {
      setBusyUserId(null);
    }
  }

  async function clearPredictionUnlock(userId: string) {
    try {
      setBusyUserId(userId);
      setMessage(null);

      const res = await fetch("/api/admin/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "clear_prediction_unlock",
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte rensa upplåsningen");
        return;
      }

      setMessage("Upplåsningen rensades.");
      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Något gick fel");
    } finally {
      setBusyUserId(null);
    }
  }

  async function createLateRegistrationInvite() {
    try {
      setMessage(null);

      const res = await fetch("/api/admin/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_late_registration_invite",
          email: inviteEmail,
          hours: Number(inviteHours),
          note: inviteNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte skapa sen registrering");
        return;
      }

      setInviteEmail("");
      setInviteNote("");
      setInviteHours("2");
      setMessage("Sen registrering skapad.");
      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Något gick fel");
    }
  }

  async function deleteInvite(inviteId: string) {
    try {
      setBusyInviteId(inviteId);
      setMessage(null);

      const res = await fetch("/api/admin/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete_late_registration_invite",
          inviteId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte ta bort sen registrering");
        return;
      }

      setMessage("Sen registrering borttagen.");
      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Något gick fel");
    } finally {
      setBusyInviteId(null);
    }
  }

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) => {
      const aHasUnlock = a.prediction_unlock_until ? 1 : 0;
      const bHasUnlock = b.prediction_unlock_until ? 1 : 0;

      if (aHasUnlock !== bHasUnlock) return bHasUnlock - aHasUnlock;

      return formatName(a).localeCompare(formatName(b), "sv");
    });
  }, [profiles]);

  return (
    <main className="min-h-screen overflow-x-hidden px-3 py-3 pb-10 sm:px-4 sm:py-4 md:px-6 md:py-8">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#020617]">
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute right-[-120px] top-[140px] h-[420px] w-[420px] rounded-full bg-emerald-400/8 blur-[140px]" />
        <div className="absolute bottom-[-140px] left-[18%] h-[360px] w-[360px] rounded-full bg-emerald-300/6 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-[1600px]">
        <header className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/6 bg-[#020617] p-4 text-white shadow-[0_30px_100px_rgba(0,0,0,0.7)] sm:p-5 md:p-6">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.14),rgba(2,6,23,0.0)_35%,rgba(2,6,23,0.0)_65%,rgba(16,185,129,0.06))]" />
          <div className="relative">
            <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/85">
              Adminläge
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
              Extra åtkomst
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/78 md:text-base">
              Här kan du tillfälligt öppna en deltagares tips efter deadline eller
              tillåta sen registrering via e-post.
            </p>

            {message && <p className="mt-4 text-sm text-white/85">{message}</p>}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 text-white backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Tips-upplåsning</h2>
                <p className="mt-1 text-sm text-white/70">
                  Klicka för att öppna en deltagares tips i 1 eller 2 timmar.
                </p>
              </div>

              <button
                onClick={loadData}
                className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-white/90 transition hover:bg-white/[0.08]"
              >
                Uppdatera
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <p className="text-sm text-white/70">Laddar...</p>
              ) : (
                sortedProfiles.map((profile) => {
                  const isBusy = busyUserId === profile.id;

                  return (
                    <div
                      key={profile.id}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                          <div className="text-base font-black text-white">
                            {formatName(profile)}
                          </div>
                          <div className="mt-1 truncate text-sm text-white/65">
                            {profile.email ?? "Ingen e-post"}
                          </div>
                          <div className="mt-2 text-xs text-white/65">
                            {profile.prediction_unlock_until
                              ? `Upplåst till: ${formatDateTime(profile.prediction_unlock_until)}`
                              : "Ingen aktiv upplåsning"}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setPredictionUnlock(profile.id, 1)}
                            disabled={isBusy}
                            className="rounded-full bg-emerald-500/95 px-4 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(16,185,129,0.30)] transition hover:bg-emerald-400 disabled:opacity-50"
                          >
                            Öppna 1h
                          </button>

                          <button
                            onClick={() => setPredictionUnlock(profile.id, 2)}
                            disabled={isBusy}
                            className="rounded-full bg-emerald-500/95 px-4 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(16,185,129,0.30)] transition hover:bg-emerald-400 disabled:opacity-50"
                          >
                            Öppna 2h
                          </button>

                          <button
                            onClick={() => clearPredictionUnlock(profile.id)}
                            disabled={isBusy}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/90 transition hover:bg-white/[0.08] disabled:opacity-50"
                          >
                            Rensa
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 text-white backdrop-blur-xl">
            <h2 className="text-xl font-black">Sen registrering</h2>
            <p className="mt-1 text-sm text-white/70">
              Lägg in e-postadress och välj hur länge registreringen ska vara öppen.
            </p>

            <div className="mt-5 space-y-3">
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="namn@epost.se"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
              />

              <select
                value={inviteHours}
                onChange={(e) => setInviteHours(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none"
              >
                <option value="1">1 timme</option>
                <option value="2">2 timmar</option>
                <option value="6">6 timmar</option>
                <option value="24">24 timmar</option>
              </select>

              <input
                value={inviteNote}
                onChange={(e) => setInviteNote(e.target.value)}
                placeholder="Anteckning (valfritt)"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
              />

              <button
                onClick={createLateRegistrationInvite}
                className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-slate-900"
              >
                Skapa sen registrering
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="text-sm font-bold text-white">{invite.email}</div>
                  <div className="mt-1 text-xs text-white/65">
                    Öppen till {formatDateTime(invite.unlock_until)}
                  </div>
                  {invite.note && (
                    <div className="mt-1 text-xs text-white/65">{invite.note}</div>
                  )}

                  <button
                    onClick={() => deleteInvite(invite.id)}
                    disabled={busyInviteId === invite.id}
                    className="mt-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/90 transition hover:bg-white/[0.08] disabled:opacity-50"
                  >
                    Ta bort
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}