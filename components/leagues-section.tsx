"use client";

type LeagueCard = {
  id: string;
  name: string;
  join_code?: string;
  type: "main" | "private";
};

export default function LeaguesSection({
  myLeagues,
}: {
  myLeagues: {
    id: string;
    name: string;
    join_code: string;
    created_by: string;
    created_at: string;
  }[];
}) {
  const leagues: LeagueCard[] = [
    {
      id: "main-league",
      name: "Huvudligan",
      type: "main",
    },
    ...myLeagues.map((league) => ({
      id: league.id,
      name: league.name,
      join_code: league.join_code,
      type: "private" as const,
    })),
  ];

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[1.75rem] sm:p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 sm:text-xl md:text-2xl">
            Ligor
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            Här hittar du huvudligan och dina egna ligor.
          </p>
        </div>

        <div className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
          {leagues.length} ligor
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {leagues.map((league) => (
          <div
            key={league.id}
            className={`rounded-2xl border p-4 shadow-sm ${
              league.type === "main"
                ? "border-indigo-200 bg-gradient-to-br from-indigo-50 via-blue-50 to-white"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-bold text-slate-900">
                  {league.name}
                </div>

                <div className="mt-2">
                  {league.type === "main" ? (
                    <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                      Officiell liga
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                      Kod: {league.join_code}
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                  league.type === "main"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {league.type === "main" ? "Main" : "Privat"}
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-white/80 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200/80">
              {league.type === "main"
                ? "Här visas den officiella huvudligan."
                : "Den här ligan använder samma tips som huvudligan."}
            </div>

            <button
              type="button"
              className="mt-4 min-h-11 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Öppna liga
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}