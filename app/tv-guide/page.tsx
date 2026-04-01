// app/tv-guide/page.tsx

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
    <main className="mx-auto max-w-4xl px-4 py-6">
      <TvGuideList matches={upcomingMatches} />
    </main>
  );
}