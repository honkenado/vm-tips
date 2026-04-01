// components/matches/MatchesToday.tsx

import type { ScheduleMatch } from "@/lib/match-schedule";

export default function MatchesToday({
  matches,
}: {
  matches: ScheduleMatch[];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Matcher idag</h1>
        <p className="text-sm text-zinc-600">
          Dagens matcher i Addes VM-tips
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-600">Inga matcher idag.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <article
              key={match.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {match.groupName} • Match {match.matchNumber}
                  </p>
                  <h2 className="text-base font-semibold text-zinc-900">
                    {match.homeTeam} – {match.awayTeam}
                  </h2>
                </div>

                <div className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-900">
                  {match.time}
                </div>
              </div>

              <div className="text-sm text-zinc-600">
                <p>{match.date}</p>
                <p>
                  <span className="font-medium text-zinc-800">TV:</span>{" "}
                  {match.tvChannel ?? "TV-kanal saknas"}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}