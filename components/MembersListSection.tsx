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

    return members.filter((m) =>
      m.display_name.toLowerCase().includes(query)
    );
  }, [members, search]);

  function getInitials(name: string) {
    const parts = name.split(" ");
    return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }

  if (loading) {
    return <p className="text-slate-500">Laddar medlemmar...</p>;
  }

  if (errorMessage) {
    return <p className="text-red-500">{errorMessage}</p>;
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      
      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Alla medlemmar
          </h2>
          <p className="text-sm text-slate-500">
            {members.length} registrerade användare
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Sök namn..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      />

      {/* LIST */}
      <div className="space-y-2">
        {filteredMembers.map((member, index) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:shadow-md hover:border-emerald-200"
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              
              {/* NUMBER */}
              <div className="text-xs font-bold text-slate-400 w-6">
                {member.member_number}
              </div>

              {/* AVATAR */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {getInitials(member.display_name)}
              </div>

              {/* NAME */}
              <div>
  <div className="font-semibold text-slate-900">
    {member.display_name}
  </div>

  {member.role === "admin" && (
    <div className="text-xs text-slate-400">
      honkenado@gmail.com
    </div>
  )}
</div>
            </div>

            {/* ROLE */}
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              {member.role === "admin" ? "Admin" : "Medlem"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}