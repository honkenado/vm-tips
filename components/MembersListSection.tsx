"use client";

import { useEffect, useMemo, useState } from "react";

type MemberEntry = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  created_at: string | null;
  display_name: string;
  member_number: number;
};

type MembersResponse = {
  members?: MemberEntry[];
  error?: string;
};

export default function MembersSection() {
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadMembers() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const res = await fetch("/api/members", {
          cache: "no-store",
        });

        const data: MembersResponse = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || "Kunde inte hämta medlemmar");
          return;
        }

        setMembers(data.members ?? []);
      } catch (error) {
        console.error("Fel vid hämtning av medlemmar", error);
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

    return members.filter((member) => {
      const fullName = member.display_name.toLowerCase();
      const username = (member.username ?? "").toLowerCase();
      return fullName.includes(query) || username.includes(query);
    });
  }, [members, search]);

  if (loading) {
    return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[1.75rem] sm:p-4 md:p-6">
        <h2 className="text-lg font-black text-slate-900 sm:text-xl md:text-2xl">
          Medlemmar
        </h2>
        <p className="mt-2 text-sm text-slate-600">Laddar medlemmar...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-3 shadow-sm sm:rounded-[1.75rem] sm:p-4 md:p-6">
        <h2 className="text-lg font-black text-slate-900 sm:text-xl md:text-2xl">
          Medlemmar
        </h2>
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[1.75rem] sm:p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 sm:text-xl md:text-2xl">
            Alla medlemmar
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            Här visas alla som har skapat konto i Addes VM-tips.
          </p>
        </div>

        <div className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
          {filteredMembers.length} av {members.length} medlemmar
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Sök namn eller användarnamn..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
        />
      </div>

      <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white sm:rounded-2xl">
        <div className="hidden grid-cols-[64px_minmax(0,1fr)_120px] bg-slate-100 px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-slate-600 md:grid">
          <div>#</div>
          <div>Namn</div>
          <div className="text-right">Roll</div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500">
            Inga medlemmar matchade din sökning.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredMembers.map((member, index) => (
              <div
                key={member.id}
                className={`grid grid-cols-[52px_minmax(0,1fr)] items-center gap-3 px-3 py-3 transition hover:bg-slate-50 md:grid-cols-[64px_minmax(0,1fr)_120px] md:px-4 ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                }`}
              >
                <div>
                  <div className="inline-flex min-w-[32px] items-center justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                    {member.member_number}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900 sm:text-[15px]">
                    {member.display_name}
                  </div>

                  {member.username && (
                    <div className="mt-0.5 truncate text-xs text-slate-500">
                      @{member.username}
                    </div>
                  )}
                </div>

                <div className="hidden text-right md:block">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                    {member.role === "admin" ? "Admin" : "Medlem"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}