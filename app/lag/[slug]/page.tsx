// app/lag/[slug]/page.tsx

import Link from "next/link";
import TeamHero from "@/components/teams/TeamHero";
import TeamSquadTable from "@/components/teams/TeamSquadTable";
import { getAllTeamProfiles, getTeamBySlug } from "@/lib/teams";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getAllTeamProfiles().map((team) => ({
    slug: team.slug,
  }));
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);

  if (!team) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-6 md:py-8">
      <div className="mb-5">
        <Link
          href="/lag"
          className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          ← Till alla lag
        </Link>
      </div>

      <div className="grid gap-6">
        <TeamHero team={team} />

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3">
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              Vägen till VM
            </h2>
            <p className="text-sm text-slate-600">
              Kvalificering och viktig turneringsbakgrund.
            </p>
          </div>

          <p className="text-sm text-slate-700">{team.qualificationSummary}</p>

          {team.qualificationPath.length > 0 ? (
            <div className="mt-4 space-y-3">
              {team.qualificationPath.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm font-black text-slate-900">{item.label}</p>
                  <p className="text-sm text-slate-600">
                    {[item.date, item.opponent, item.result].filter(Boolean).join(" • ")}
                  </p>
                  {item.note ? (
                    <p className="mt-1 text-sm text-slate-600">{item.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <TeamSquadTable squad={team.squad} />
      </div>
    </main>
  );
}