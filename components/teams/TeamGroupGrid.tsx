// components/teams/TeamGroupGrid.tsx

import TeamCard from "@/components/teams/TeamCard";
import type { TeamProfile } from "@/types/team";

type TeamGroupGridProps = {
  groupLetter: string;
  teams: TeamProfile[];
};

export default function TeamGroupGrid({
  groupLetter,
  teams,
}: TeamGroupGridProps) {
  return (
    <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-900">
          Grupp {groupLetter}
        </h2>
        <p className="text-sm text-slate-600">Klicka på ett lag för mer info.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {teams.map((team) => (
          <TeamCard key={team.slug} team={team} />
        ))}
      </div>
    </section>
  );
}