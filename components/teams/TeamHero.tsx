// components/teams/TeamHero.tsx

import type { TeamProfile } from "@/types/team";

export default function TeamHero({ team }: { team: TeamProfile }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Grupp {team.groupLetter}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {team.name}
          </h1>
          <p className="max-w-3xl text-sm text-slate-600">
            {team.shortDescription}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:min-w-[460px]">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              FIFA-ranking
            </p>
            <p className="text-lg font-black text-slate-900">
              {team.fifaRank ?? "–"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Förbund
            </p>
            <p className="text-lg font-black text-slate-900">
              {team.confederation ?? "–"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Tränare
            </p>
            <p className="text-lg font-black text-slate-900">
              {team.coach ?? "–"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Truppstorlek
            </p>
            <p className="text-lg font-black text-slate-900">{team.squad.length}</p>
          </div>
        </div>
      </div>
    </section>
  );
}