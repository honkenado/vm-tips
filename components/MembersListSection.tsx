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

export default function MembersListSection() {
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await fetch("/api/members", { cache: "no-store" });
        const data: MembersResponse = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || "Kunde inte hämta medlemmar");
          return;
        }

        setMembers(data.members ?? []);
      } catch {
        setErrorMessage("Kunde inte hämta medlemmar");
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
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

      <div className="mb-5">
        <input
          type="text"
          placeholder="Sök deltagare..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-[#020617]/60 px-4 py-3 text-base text-white placeholder:text-white/35 focus:border-emerald-400/60 focus:outline-none"
        />
      </div>

      {filteredMembers.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center">
          <p className="text-sm text-white/65">
            Hittade inga medlemmar som matchar din sökning.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMembers.map((member) => (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}