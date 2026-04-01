// app/matcher-idag/page.tsx

import MatchesToday from "@/components/matches/MatchesToday";
import { getGroupStageSchedule } from "@/lib/match-schedule";
import { getMatchesToday } from "@/lib/match-utils";

export const metadata = {
  title: "Matcher idag | Addes VM-tips",
  description: "Se dagens matcher i VM-tipset.",
};

export default function MatchesTodayPage() {
  const schedule = getGroupStageSchedule();
  const todayMatches = getMatchesToday(schedule);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <MatchesToday matches={todayMatches} />
    </main>
  );
}