"use client";

import { useEffect, useState } from "react";

type InvitesResponse = {
  invites?: Array<{
    id: string;
  }>;
  error?: string;
};

export default function LeagueInviteBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadInvites() {
      try {
        const res = await fetch("/api/leagues/invites", {
          cache: "no-store",
        });

        if (!res.ok) {
          if (isMounted) setCount(0);
          return;
        }

        const data: InvitesResponse = await res.json();

        if (isMounted) {
          setCount(data.invites?.length ?? 0);
        }
      } catch {
        if (isMounted) setCount(0);
      }
    }

    loadInvites();

    return () => {
      isMounted = false;
    };
  }, []);

  if (count <= 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex min-w-[20px] items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-500 px-1.5 py-[2px] text-[10px] font-black leading-none text-slate-950 shadow-[0_6px_20px_rgba(16,185,129,0.35)]">
      {count > 9 ? "9+" : count}
    </span>
  );
}