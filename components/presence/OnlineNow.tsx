"use client";

import { useEffect, useState } from "react";

type OnlineUser = {
  user_id: string;
  page: string | null;
  last_seen: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
};

function getDisplayName(user: OnlineUser) {
  const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  return fullName || user.username || "Okänd användare";
}

function getInitials(user: OnlineUser) {
  const name = getDisplayName(user);
  const parts = name.split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function OnlineNow({
  isLoggedIn,
}: {
  isLoggedIn: boolean;
}) {
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPresence({ silent = false }: { silent?: boolean } = {}) {
    try {
      if (!silent) {
        setLoading(true);
      }

      const res = await fetch("/api/presence", { cache: "no-store" });
      const data = await res.json();

      if (res.ok) {
        setUsers(Array.isArray(data.users) ? data.users : []);
      }
    } catch (error) {
      console.error("Fel vid hämtning av online-status", error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  async function sendHeartbeat() {
    if (!isLoggedIn) return;

    try {
      await fetch("/api/presence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page: "home" }),
      });
    } catch (error) {
      console.error("Fel vid heartbeat", error);
    }
  }

  useEffect(() => {
    loadPresence();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    sendHeartbeat();

    const heartbeatInterval = window.setInterval(() => {
      sendHeartbeat();
    }, 30000);

    return () => window.clearInterval(heartbeatInterval);
  }, [isLoggedIn]);

  useEffect(() => {
    const refreshInterval = window.setInterval(() => {
      loadPresence({ silent: true });
    }, 15000);

    return () => window.clearInterval(refreshInterval);
  }, []);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xl font-black text-white">Online nu</h2>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-3 py-1 text-xs font-bold text-emerald-100">
          {users.length} online
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/72">
          Laddar online-lista...
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/72">
          Ingen är online just nu
        </div>
      ) : (
        <div className="grid gap-2">
          {users.slice(0, 6).map((user) => (
            <div
              key={user.user_id}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/12 text-sm font-black text-emerald-100">
                  {getInitials(user)}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#020617] bg-emerald-400" />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-white">
                    {getDisplayName(user)}
                  </div>
                  <div className="text-xs text-white/65">
                    {user.page === "home" ? "På startsidan" : "Aktiv nyligen"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}