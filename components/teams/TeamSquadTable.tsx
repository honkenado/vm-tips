// components/teams/TeamSquadTable.tsx

import type { TeamPlayer } from "@/types/team";

export default function TeamSquadTable({ squad }: { squad: TeamPlayer[] }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-black tracking-tight text-slate-900">Trupp</h2>
        <p className="text-sm text-slate-600">Spelare och grundläggande statistik.</p>
      </div>

      {squad.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          Truppen är inte inläst ännu.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
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
                  <td className="px-3 py-3">{player.position}</td>
                  <td className="px-3 py-3">{player.club ?? "–"}</td>
                  <td className="px-3 py-3">{player.age ?? "–"}</td>
                  <td className="px-3 py-3">{player.caps ?? "–"}</td>
                  <td className="px-3 py-3">{player.goals ?? "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}