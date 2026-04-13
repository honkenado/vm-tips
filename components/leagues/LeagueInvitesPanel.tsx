"use client";

import { useEffect, useState } from "react";

type Invite = {
  id: string;
  status: string;
  created_at: string;
  leagues: {
    id: string;
    name: string;
  } | null;
  inviter: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
};

type InvitesResponse = {
  invites?: Invite[];
  error?: string;
};

function getInviterName(inviter: Invite["inviter"]) {
  if (!inviter) return "Någon";

  const name = [inviter.first_name, inviter.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Någon";
}

export default function LeagueInvitesPanel() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function loadInvites() {
    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch("/api/leagues/invites", { cache: "no-store" });
      const data: InvitesResponse = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Kunde inte hämta inbjudningar");
        return;
      }

      setInvites(data.invites ?? []);
    } catch {
      setErrorMessage("Kunde inte hämta inbjudningar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvites();
  }, []);

  async function respondToInvite(inviteId: string, action: "accepted" | "declined") {
    try {
      setActionLoadingId(inviteId);
      setErrorMessage(null);

      const res = await fetch("/api/leagues/invites/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Kunde inte svara på inbjudan");
        return;
      }

      setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
    } catch {
      setErrorMessage("Kunde inte svara på inbjudan");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5 md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-black text-white sm:text-2xl">
          Ligainbjudningar
        </h2>
        <p className="mt-1 text-sm text-white/60">
          Här ser du förfrågningar till privata ligor.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-white/70">Laddar inbjudningar...</p>
      ) : errorMessage ? (
        <p className="text-sm text-red-200">{errorMessage}</p>
      ) : invites.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center">
          <p className="text-sm text-white/65">Du har inga väntande inbjudningar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <p className="text-sm text-white/85">
                <span className="font-bold">{getInviterName(invite.inviter)}</span>{" "}
                har bjudit in dig till{" "}
                <span className="font-bold">{invite.leagues?.name ?? "en liga"}</span>.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => respondToInvite(invite.id, "accepted")}
                  disabled={actionLoadingId === invite.id}
                  className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoadingId === invite.id ? "Sparar..." : "Acceptera"}
                </button>

                <button
                  type="button"
                  onClick={() => respondToInvite(invite.id, "declined")}
                  disabled={actionLoadingId === invite.id}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Tacka nej
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}