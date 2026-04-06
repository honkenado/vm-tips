import Link from "next/link";
import TvGuideList from "@/components/matches/TvGuideList";
import { getGroupStageSchedule } from "@/lib/match-schedule";
import { getUpcomingMatches } from "@/lib/match-utils";

export const metadata = {
  title: "TV-guide | Addes VM-tips",
  description: "Se gruppspelets matcher, tider och tv-kanaler.",
};

export default function TvGuidePage() {
  const schedule = getGroupStageSchedule();
  const upcomingMatches = getUpcomingMatches(schedule);

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
          >
            ← Till startsidan
          </Link>
        </div>

        <section className="card-premium-strong mb-4 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-400">
                Addes VM-tips
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                TV-guide
              </h1>
              <p className="text-muted-premium mt-2 max-w-2xl text-sm leading-6">
                Se kommande matcher, tider och tv-kanaler för gruppspelet.
              </p>
            </div>
          </div>
        </section>

        <section className="card-premium p-4 sm:p-6">
          <TvGuideList matches={upcomingMatches} />
        </section>
      </div>
    </main>
  );
}