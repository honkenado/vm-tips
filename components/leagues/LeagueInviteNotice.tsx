"use client";

import Link from "next/link";
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

export default function LeagueInviteNotice() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvites() {
      try {
        const res = await fetch("/api/leagues/invites", {
          cache: "no-store",
        });

        if (!res.ok) {
          setInvites([]);
          return;
        }

        const data: InvitesResponse = await res.json();
        setInvites(data.invites ?? []);
      } catch {
        setInvites([]);
      } finally {
        setLoading(false);
      }
    }

    loadInvites();
  }, []);

  if (loading || invites.length === 0) {
    return null;
  }

  const firstInvite = invites[0];
  const count = invites.length;

  return (
    <div className="mb-4 rounded-[1.75rem] border border-emerald-400/20 bg-emerald-500/10 p-4 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-300">
            Ligainbjudan
          </p>

          <h3 className="mt-1 text-lg font-black text-white sm:text-xl">
            {count === 1
              ? "Du har 1 väntande ligainbjudan"
              : `Du har ${count} väntande ligainbjudningar`}
          </h3>

          <p className="mt-2 text-sm text-white/75">
            {count === 1 ? (
              <>
                <span className="font-semibold">
                  {getInviterName(firstInvite.inviter)}
                </span>{" "}
                har bjudit in dig till{" "}
                <span className="font-semibold">
                  {firstInvite.leagues?.name ?? "en liga"}
                </span>
                .
              </>
            ) : (
              <>Gå till ligasidan för att acceptera eller tacka nej.</>
            )}
          </p>
        </div>

        <Link
          href="/league"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
        >
          Gå till ligor
        </Link>
      </div>
    </div>
  );
}