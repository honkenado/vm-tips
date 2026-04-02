import Link from "next/link";
import { getGroupStageSchedule } from "@/lib/match-schedule";
import {
  getMatchesToday,
  getNextMatchdayMatches,
  getNextMatchdayLabel,
} from "@/lib/match-utils";

export default function HomeMatchesTodayWidget() {
  const schedule = getGroupStageSchedule();
  const todayMatches = getMatchesToday(schedule);
  const nextMatchdayMatches = getNextMatchdayMatches(schedule);

  const showingToday = todayMatches.length > 0;
  const matchesToShow = showingToday ? todayMatches : nextMatchdayMatches;

  const heading = showingToday ? "Matcher idag" : "Nästa matcher";
  const subheading = showingToday
    ? "Snabb koll på dagens sändningar"
    : nextMatchdayMatches.length > 0
    ? `Nästa matchdag: ${getNextMatchdayLabel(schedule)}`
    : "Inga matcher att visa just nu.";

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900">
            {heading}
          </h2>
          <p className="text-sm text-slate-600">{subheading}</p>
        </div>

        <Link
          href="/tv-guide"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
        >
          Se allt
        </Link>
      </div>

      {matchesToShow.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
          Inga matcher att visa just nu.
        </div>
      ) : (
        <div className="space-y-3">
          {matchesToShow.slice(0, 2).map((match) => (
            <div
              key={match.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
            >
              <div className="mb-1 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">
                    {match.homeTeam} – {match.awayTeam}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {match.groupName} • Match {match.matchNumber}
                  </p>
                </div>

                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-slate-700 shadow-sm">
                  {match.time}
                </span>
              </div>

              <p className="text-sm text-slate-600">
                TV: {match.tvChannel ?? "TV-kanal saknas"}
                {match.streamingChannel
                  ? ` • Stream: ${match.streamingChannel}`
                  : ""}
              </p>
            </div>
          ))}

          <Link
            href="/matcher-idag"
            className="inline-flex h-10 w-full items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-extrabold text-white transition hover:bg-slate-800"
          >
            {showingToday ? "Öppna dagens matcher" : "Öppna nästa matchdag"}
          </Link>
        </div>
      )}
    </section>
  );
}