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

type OwnedLeaguesResponse = {
  leagues?: OwnedLeague[];
  error?: string;
};

type MeResponse = {
  user?: {
    id: string;
  } | null;
  error?: string;
};

type SentInvite = {
  id: string;
  league_id: string;
  invited_user_id: string;
  status: string;
};

type SentInvitesResponse = {
  invites?: SentInvite[];
  error?: string;
};

type MemberIdsResponse = {
  memberIds?: string[];
  error?: string;
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

  const [sentInvites, setSentInvites] = useState<SentInvite[]>([]);
  const [selectedLeagueMemberIds, setSelectedLeagueMemberIds] = useState<string[]>(
    []
  );

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const [membersRes, leaguesRes, meRes, sentInvitesRes] =
          await Promise.all([
            fetch("/api/members", { cache: "no-store" }),
            fetch("/api/leagues/my-owned", { cache: "no-store" }),
            fetch("/api/me", { cache: "no-store" }),
            fetch("/api/leagues/invites/sent", { cache: "no-store" }),
          ]);

        const membersData: MembersResponse = await membersRes.json();
        const leaguesData: OwnedLeaguesResponse = await leaguesRes.json();
        const meData: MeResponse = await meRes.json();
        const sentInvitesData: SentInvitesResponse = await sentInvitesRes.json();

        if (!membersRes.ok) {
          setErrorMessage(membersData.error || "Kunde inte hämta medlemmar");
          return;
        }

        setMembers(membersData.members ?? []);

        if (leaguesRes.ok) {
          const leagues = Array.isArray(leaguesData.leagues)
            ? leaguesData.leagues
            : [];

          setOwnedLeagues(leagues);

          if (leagues.length > 0) {
            setSelectedLeagueId((prev) => prev || leagues[0].id);
          }
        }

        if (meRes.ok) {
          setCurrentUserId(meData.user?.id ?? null);
        }

        if (sentInvitesRes.ok) {
          setSentInvites(sentInvitesData.invites ?? []);
        }
      } catch {
        setErrorMessage("Kunde inte hämta medlemmar");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  useEffect(() => {
    async function loadSelectedLeagueMembers() {
      if (!selectedLeagueId) {
        setSelectedLeagueMemberIds([]);
        return;
      }

      try {
        const res = await fetch(`/api/leagues/${selectedLeagueId}/member-ids`, {
          cache: "no-store",
        });

        const data: MemberIdsResponse = await res.json();

        if (!res.ok) {
          setSelectedLeagueMemberIds([]);
          return;
        }

        setSelectedLeagueMemberIds(data.memberIds ?? []);
      } catch {
        setSelectedLeagueMemberIds([]);
      }
    }

    loadSelectedLeagueMembers();
  }, [selectedLeagueId]);

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

  const selectedLeague =
    ownedLeagues.find((league) => league.id === selectedLeagueId) ?? null;

  function getPendingInviteForMember(memberId: string) {
    return sentInvites.find(
      (invite) =>
        invite.invited_user_id === memberId &&
        invite.league_id === selectedLeagueId &&
        invite.status === "pending"
    );
  }

  function isAlreadyMember(memberId: string) {
    return selectedLeagueMemberIds.includes(memberId);
  }

  async function refreshSentInvites() {
    try {
      const sentRes = await fetch("/api/leagues/invites/sent", {
        cache: "no-store",
      });

      const sentData: SentInvitesResponse = await sentRes.json();

      if (sentRes.ok) {
        setSentInvites(sentData.invites ?? []);
      }
    } catch {}
  }

  async function refreshSelectedLeagueMembers() {
    if (!selectedLeagueId) return;

    try {
      const res = await fetch(`/api/leagues/${selectedLeagueId}/member-ids`, {
        cache: "no-store",
      });

      const data: MemberIdsResponse = await res.json();

      if (res.ok) {
        setSelectedLeagueMemberIds(data.memberIds ?? []);
      }
    } catch {}
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

      await refreshSentInvites();

      setInviteMessage(
        `Inbjudan skickad till ${displayName}${
          selectedLeague ? ` (${selectedLeague.name})` : ""
        }`
      );
    } catch {
      setInviteMessage("Kunde inte skicka inbjudan");
    } finally {
      setInviteLoadingId(null);
    }
  }

  async function undoInvite(inviteId: string, displayName: string) {
    setInviteLoadingId(inviteId);
    setInviteMessage(null);

    try {
      const res = await fetch(`/api/leagues/invite/${inviteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteMessage(data.error || "Kunde inte ångra inbjudan");
        return;
      }

      setSentInvites((prev) => prev.filter((invite) => invite.id !== inviteId));

      setInviteMessage(
        `Inbjudan till ${displayName} har tagits bort${
          selectedLeague ? ` från ${selectedLeague.name}` : ""
        }.`
      );
    } catch {
      setInviteMessage("Kunde inte ångra inbjudan");
    } finally {
      setInviteLoadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <p className="text-sm text-white/70">Laddar medlemmar...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-[1.75rem] border border-red-400/20 bg-red-500/10 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <p className="text-sm text-red-200">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5 md:p-6">
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

      {ownedLeagues.length > 0 ? (
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

          {selectedLeague ? (
            <p className="mt-2 text-xs text-emerald-200/90">
              Inbjudningar skickas just nu till{" "}
              <span className="font-bold">{selectedLeague.name}</span>.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mb-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3">
          <p className="text-sm text-amber-100">
            Ingen egen liga hittades för ditt konto, så inbjudningsknappar visas
            inte.
          </p>
        </div>
      )}

      <div className="mb-5">
        <input
          type="text"
          placeholder="Sök deltagare..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-[#020617]/60 px-4 py-3 text-base text-white placeholder:text-white/35 focus:border-emerald-400/60 focus:outline-none"
        />
      </div>

      {inviteMessage ? (
        <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
          <p className="text-sm text-emerald-200">{inviteMessage}</p>
        </div>
      ) : null}

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
            const alreadyMember = isAlreadyMember(member.id);
            const pendingInvite = getPendingInviteForMember(member.id);
            const canInvite =
              ownedLeagues.length > 0 && !isSelf && !alreadyMember;

            const isUndoLoading = inviteLoadingId === pendingInvite?.id;
            const isInviteLoading =
              inviteLoadingId === member.id && !pendingInvite;

            return (
              <div
                key={member.id}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/12 text-sm font-black text-emerald-100">
                      {getInitials(member.display_name)}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-base font-bold text-white">
                        {member.display_name}
                      </div>
                      <div className="mt-1 text-xs text-white/45">
                        Medlem #{member.member_number}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold ${getRoleClasses(
                      member.role
                    )}`}
                  >
                    {getRoleLabel(member.role)}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-xs text-white/45">
                    {member.role === "admin"
                      ? "Driver och hanterar tipset"
                      : "Deltar i årets VM-tips"}
                  </div>

                  {member.role === "admin" ? (
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
                      Admin
                    </span>
                  ) : null}
                </div>

                {isSelf ? (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-xs text-white/45">
                    Du kan inte bjuda in dig själv
                  </div>
                ) : alreadyMember ? (
                  <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-center text-xs font-semibold text-cyan-100">
                    Redan med i ligan
                  </div>
                ) : pendingInvite ? (
                  <div className="mt-4 space-y-2">
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-center text-xs font-semibold text-emerald-200">
                      Inbjudan skickad
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        undoInvite(pendingInvite.id, member.display_name)
                      }
                      disabled={isUndoLoading}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUndoLoading ? "Ångrar..." : "Ångra inbjudan"}
                    </button>
                  </div>
                ) : canInvite ? (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() =>
                        inviteToLeague(member.id, member.display_name)
                      }
                      disabled={isInviteLoading}
                      className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isInviteLoading
                        ? "Skickar..."
                        : "Bjud in till vald liga"}
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}