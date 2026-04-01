// app/tv-guide/page.tsx

import TvGuideList from "@/components/matches/TvGuideList";
import { getGroupStageSchedule } from "@/lib/match-schedule";

export const metadata = {
  title: "TV-guide | Addes VM-tips",
  description: "Se gruppspelets matcher, tider och tv-kanaler.",
};

export default function TvGuidePage() {
  const schedule = getGroupStageSchedule();

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <TvGuideList matches={schedule} />
    </main>
  );
}