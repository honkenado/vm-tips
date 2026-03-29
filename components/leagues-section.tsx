type MyLeague = {
  id: string;
  name: string;
  join_code: string;
  created_by: string;
  created_at: string;
};

export default function LeaguesSection({
  myLeagues,
  onCreateLeague,
  onJoinLeague,
}: {
  myLeagues: MyLeague[];
  onCreateLeague: () => void | Promise<void>;
  onJoinLeague: () => void | Promise<void>;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Ligor</h2>
          <p className="mt-1 text-sm text-slate-600">
            Skapa en egen kompisliga eller gå med i en befintlig liga.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onCreateLeague}
            className="inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Skapa liga
          </button>

          <button
            onClick={onJoinLeague}
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Gå med i liga
          </button>
        </div>
      </div>

      {myLeagues.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Du är inte med i någon liga ännu.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {myLeagues.map((league) => (
            <div
              key={league.id}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="text-lg font-black text-slate-900">{league.name}</div>
              <div className="mt-2 text-sm text-slate-600">
                Ligakod:{" "}
                <span className="font-bold text-slate-900">
                  {league.join_code}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}