// components/teams/TeamSquadTable.tsx

import type { TeamPlayer } from "@/types/team";

export default function TeamSquadTable({ squad }: { squad: TeamPlayer[] }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-black tracking-tight text-slate-900">Trupp</h2>
        <p className="text-sm text-slate-900">Spelare och grundläggande statistik.</p>
      </div>

      {squad.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-900">
          Truppen är inte inläst ännu.
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {squad.map((player) => (
              <article
                key={player.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {player.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-900">
                      {player.position}
                    </p>
                  </div>

                  <div className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-slate-700 shadow-sm">
                    #{player.shirtNumber ?? "–"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-slate-900">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Klubb
                    </p>
                    <p>{player.club ?? "–"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Ålder
                    </p>
                    <p>{player.age ?? "–"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Landskamper
                    </p>
                    <p>{player.caps ?? "–"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Mål
                    </p>
                    <p>{player.goals ?? "–"}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm text-slate-900">
              <thead>
                <tr className="border-b border-slate-200 text-slate-900">
                  <th className="px-3 py-3 font-bold">#</th>
                  <th className="px-3 py-3 font-bold">Namn</th>
                  <th className="px-3 py-3 font-bold">Position</th>
                  <th className="px-3 py-3 font-bold">Klubb</th>
                  <th className="px-3 py-3 font-bold">Ålder</th>
                  <th className="px-3 py-3 font-bold">Landskamper</th>
                  <th className="px-3 py-3 font-bold">Mål</th>
                </tr>
              </thead>
              <tbody>
                {squad.map((player) => (
                  <tr key={player.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">{player.shirtNumber ?? "–"}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      {player.name}
                    </td>
                    <td className="px-3 py-3 text-slate-900">{player.position}</td>
                    <td className="px-3 py-3 text-slate-900">{player.club ?? "–"}</td>
                    <td className="px-3 py-3 text-slate-900">{player.age ?? "–"}</td>
                    <td className="px-3 py-3 text-slate-900">{player.caps ?? "–"}</td>
                    <td className="px-3 py-3 text-slate-900">{player.goals ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}