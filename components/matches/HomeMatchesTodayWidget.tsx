// components/matches/HomeMatchesTodayWidget.tsx

import Link from "next/link";
import { getGroupStageSchedule } from "@/lib/match-schedule";
import { getMatchesToday, getMatchesTomorrow } from "@/lib/match-utils";

export default function HomeMatchesTodayWidget() {
  const schedule = getGroupStageSchedule();
  const todayMatches = getMatchesToday(schedule);
  const tomorrowMatches = getMatchesTomorrow(schedule);

  const matchesToShow = todayMatches.length > 0 ? todayMatches : tomorrowMatches;
  const heading = todayMatches.length > 0 ? "Matcher idag" : "Matcher imorgon";

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{heading}</h2>
          <p className="text-sm text-zinc-600">
            Snabb överblick över kommande matcher
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/matcher-idag"
            className="rounded-full border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Matchdag
          </Link>
          <Link
            href="/tv-guide"
            className="rounded-full bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            TV-guide
          </Link>
        </div>
      </div>

      {matchesToShow.length === 0 ? (
        <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
          Inga matcher hittades.
        </div>
      ) : (
        <div className="space-y-3">
          {matchesToShow.slice(0, 3).map((match) => (
            <div
              key={match.id}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="mb-1 flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-zinc-900">
                  {match.homeTeam} – {match.awayTeam}
                </p>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700">
                  {match.time}
                </span>
              </div>

              <p className="text-xs text-zinc-500">
                {match.groupName} • Match {match.matchNumber}
              </p>

              <p className="mt-2 text-sm text-zinc-600">
                TV: {match.tvChannel ?? "TV-kanal saknas"}
                {match.streamingChannel ? ` • Stream: ${match.streamingChannel}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}