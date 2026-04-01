// components/teams/TeamCard.tsx

import Link from "next/link";
import type { TeamProfile } from "@/types/team";

type TeamCardProps = {
  team: TeamProfile;
};

export default function TeamCard({ team }: TeamCardProps) {
  const meta: string[] = [];

  if (typeof team.fifaRank === "number") {
    meta.push(`FIFA-ranking #${team.fifaRank}`);
  }

  if (team.confederation) {
    meta.push(team.confederation);
  }

  if (team.coach) {
    meta.push(`Tränare: ${team.coach}`);
  }

  return (
    <Link
      href={`/lag/${team.slug}`}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Grupp {team.groupLetter}
            </p>
            <h3 className="text-base font-black text-slate-900">{team.name}</h3>
          </div>

          {typeof team.fifaRank === "number" ? (
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
              FIFA #{team.fifaRank}
            </div>
          ) : null}
        </div>

        {team.shortDescription ? (
          <p className="line-clamp-3 text-sm text-slate-600">
            {team.shortDescription}
          </p>
        ) : meta.length > 0 ? (
          <p className="text-sm text-slate-600">{meta.join(" • ")}</p>
        ) : (
          <p className="text-sm text-slate-500">Trupp, statistik och laginfo</p>
        )}

        <div className="pt-1 text-sm font-bold text-emerald-700">
          Visa lag →
        </div>
      </div>
    </Link>
  );
}