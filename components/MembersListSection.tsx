"use client";

import { useEffect, useMemo, useState } from "react";

type MemberEntry = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  display_name: string;
  member_number: number;
};

type MembersResponse = {
  members?: MemberEntry[];
  error?: string;
};

type OwnedLeague = {
  id: string;
  name: string;
  join_code: string;
  created_by: string | null;
  created_at: string | null;
};

type MeResponse = {
  user?: {
    id: string;
  } | null;
};

export default function MembersListSection() {
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [ownedLeagues, setOwnedLeagues] = useState<OwnedLeague[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [inviteLoadingId, setInviteLoadingId] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadAll() {
      try {
        const [membersRes, leaguesRes, meRes] = await Promise.all([
          fetch("/api/members", { cache: "no-store" }),
          fetch("/api/leagues/my-owned", { cache: "no-store" }),
          fetch("/api/me", { cache: "no-store" }),
        ]);

        const membersData: MembersResponse = await membersRes.json();
        const leaguesData = await leaguesRes.json();
        const meData: MeResponse = await meRes.json();

        if (!membersRes.ok) {
          setErrorMessage(membersData.error || "Kunde inte hämta medlemmar");
          return;
        }

        setMembers(membersData.members ?? []);

        const leagues = leaguesData.leagues ?? [];
        setOwnedLeagues(leagues);

        if (leagues.length > 0) {
          setSelectedLeagueId(leagues[0].id);
        }

        setCurrentUserId(meData.user?.id ?? null);
      } catch {
        setErrorMessage("Kunde inte hämta medlemmar");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;

    return members.filter((member) =>
      member.display_name.toLowerCase().includes(query)
    );
  }, [members, search]);

  function getInitials(name: string) {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function getRoleLabel(role: string | null) {
    return role === "admin" ? "Admin" : "Medlem";
  }

  function getRoleClasses(role: string | null) {
    return role === "admin"
      ? "border-emerald-400/20 bg-emerald-500/12 text-emerald-200"
      : "border-white/10 bg-white/[0.05] text-white/70";
  }

  async function inviteToLeague(memberId: string, displayName: string) {
    if (!selectedLeagueId) return;

    setInviteLoadingId(memberId);
    setInviteMessage(null);

    try {
      const res = await fetch("/api/leagues/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leagueId: selectedLeagueId,
          invitedUserId: memberId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteMessage(data.error || "Kunde inte skicka inbjudan");
        return;
      }

      setInviteMessage(`Inbjudan skickad till ${displayName}`);
    } catch {
      setInviteMessage("Kunde inte skicka inbjudan");
    } finally {
      setInviteLoadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 text-white backdrop-blur-xl">
        <p className="text-sm text-white/70">Laddar medlemmar...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-[1.75rem] border border-red-400/20 bg-red-500/10 p-5 backdrop-blur-xl">
        <p className="text-sm text-red-200">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 text-white backdrop-blur-xl sm:p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-white sm:text-2xl">
            Alla medlemmar
          </h2>
          <p className="mt-1 text-sm text-white/60">
            {members.length} registrerade användare
          </p>
        </div>

        <div className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-4 py-2 text-sm font-bold text-emerald-100">
          {filteredMembers.length} visas
        </div>
      </div>

      {/* 🔥 Dropdown */}
      {ownedLeagues.length > 0 && (
        <div className="mb-5">
          <label className="mb-2 block text-sm font-bold text-white">
            Bjud in till liga
          </label>

          <select
            value={selectedLeagueId}
            onChange={(e) => setSelectedLeagueId(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#020617]/60 px-4 py-3 text-white focus:border-emerald-400/60 focus:outline-none"
          >
            {ownedLeagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-5">
        <input
          type="text"
          placeholder="Sök deltagare..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-[#020617]/60 px-4 py-3 text-white placeholder:text-white/35 focus:border-emerald-400/60 focus:outline-none"
        />
      </div>

      {inviteMessage && (
        <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
          <p className="text-sm text-emerald-200">{inviteMessage}</p>
        </div>
      )}

      {filteredMembers.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center">
          <p className="text-sm text-white/65">
            Hittade inga medlemmar som matchar din sökning.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMembers.map((member) => {
            const isSelf = currentUserId === member.id;
            const canInvite = ownedLeagues.length > 0 && !isSelf;

            return (
              <div
                key={member.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-100 font-bold">
                    {getInitials(member.display_name)}
                  </div>

                  <div>
                    <div className="font-bold">{member.display_name}</div>
                    <div className="text-xs text-white/50">
                      Medlem #{member.member_number}
                    </div>
                  </div>
                </div>

                {canInvite && (
                  <button
                    onClick={() =>
                      inviteToLeague(member.id, member.display_name)
                    }
                    disabled={inviteLoadingId === member.id}
                    className="mt-4 w-full rounded-xl bg-emerald-500 py-2 text-sm font-bold text-black"
                  >
                    {inviteLoadingId === member.id
                      ? "Skickar..."
                      : "Bjud in till min liga"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}