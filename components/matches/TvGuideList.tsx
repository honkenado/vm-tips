// components/matches/TvGuideList.tsx

import type { ScheduleMatch } from "@/lib/match-schedule";
import { groupMatchesByDate } from "@/lib/match-utils";

export default function TvGuideList({
  matches,
}: {
  matches: ScheduleMatch[];
}) {
  const grouped = groupMatchesByDate(matches);
  const dates = Object.keys(grouped);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">TV-guide</h1>
        <p className="text-sm text-zinc-600">
          Matcher, tider och kanaler
        </p>
      </div>

      <div className="space-y-4">
        {dates.map((date) => (
          <div
            key={date}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
          >
            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <h2 className="text-sm font-semibold text-zinc-900">{date}</h2>
            </div>

            <div className="divide-y divide-zinc-200">
              {grouped[date].map((match) => (
                <div
                  key={match.id}
                  className="grid grid-cols-1 gap-2 px-4 py-3 md:grid-cols-[80px_1fr_160px]"
                >
                  <div className="text-sm font-semibold text-zinc-900">
                    {match.time}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {match.homeTeam} – {match.awayTeam}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {match.groupName} • Match {match.matchNumber}
                    </p>
                  </div>

                  <div className="text-sm text-zinc-600">
                    {match.tvChannel ?? "TV-kanal saknas"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}