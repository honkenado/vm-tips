import { isDeadlinePassed } from "@/lib/config";
import type { KnockoutMatch } from "@/types/tournament";

export default function MatchButtons({
  match,
  selectedWinners,
  onSelectWinner,
  compact = false,
}: {
  match: KnockoutMatch;
  selectedWinners: Record<string, string>;
  onSelectWinner: (matchId: string, team: string) => void;
  compact?: boolean;
}) {
  const deadlinePassed = isDeadlinePassed();

  const homeDisabled =
    deadlinePassed || !match.home || match.home.startsWith("?");
  const awayDisabled =
    deadlinePassed || !match.away || match.away.startsWith("?");

  const chosenHome = selectedWinners[match.id] === match.home;
  const chosenAway = selectedWinners[match.id] === match.away;

  return (
    <div
      className={`bg-white/92 shadow-sm backdrop-blur-sm ${
        compact
          ? "w-full rounded-xl border border-emerald-200/70 p-2 sm:p-2.5 xl:w-[152px] xl:rounded-xl xl:border xl:border-emerald-200/70 xl:p-1.5 xl:shadow-[0_6px_18px_rgba(15,23,42,0.12)]"
          : "w-full rounded-2xl border border-emerald-200/70 p-3 sm:p-4"
      }`}
    >
      {match.label ? (
        <div
          className={`font-bold uppercase tracking-wide text-slate-500 ${
            compact
              ? "mb-2 text-[10px] leading-none sm:text-[11px] xl:mb-1 xl:text-[9px]"
              : "mb-2 text-[11px] sm:mb-3 sm:text-xs"
          }`}
        >
          {match.label}
        </div>
      ) : null}

      <div className={compact ? "grid gap-2 xl:gap-1" : "grid gap-2"}>
        <button
          disabled={homeDisabled}
          onClick={() => onSelectWinner(match.id, match.home)}
          className={`font-semibold transition ${
            compact
              ? "min-h-11 rounded-xl px-3 py-2 text-sm xl:min-h-[24px] xl:rounded-lg xl:px-2 xl:py-0.5 xl:text-[11px]"
              : "min-h-12 rounded-xl px-4 py-3 text-sm sm:text-base"
          } ${
            chosenHome
              ? "bg-emerald-500 text-white shadow-[0_8px_18px_rgba(16,185,129,0.22)]"
              : "border border-slate-200 bg-white text-slate-900 hover:border-emerald-300 hover:bg-emerald-50/60"
          } ${homeDisabled ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <span className="block truncate text-center leading-tight">
            {match.home || "Väntar..."}
          </span>
        </button>

        <div
          className={`text-center font-semibold uppercase tracking-wide text-slate-400 ${
            compact
              ? "text-[10px] leading-none xl:text-[8px]"
              : "text-[10px] sm:text-xs"
          }`}
        >
          vs
        </div>

        <button
          disabled={awayDisabled}
          onClick={() => onSelectWinner(match.id, match.away)}
          className={`font-semibold transition ${
            compact
              ? "min-h-11 rounded-xl px-3 py-2 text-sm xl:min-h-[24px] xl:rounded-lg xl:px-2 xl:py-0.5 xl:text-[11px]"
              : "min-h-12 rounded-xl px-4 py-3 text-sm sm:text-base"
          } ${
            chosenAway
              ? "bg-emerald-500 text-white shadow-[0_8px_18px_rgba(16,185,129,0.22)]"
              : "border border-slate-200 bg-white text-slate-900 hover:border-emerald-300 hover:bg-emerald-50/60"
          } ${awayDisabled ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <span className="block truncate text-center leading-tight">
            {match.away || "Väntar..."}
          </span>
        </button>

        {deadlinePassed && (
          <div
            className={`text-center font-medium text-rose-500 ${
              compact
                ? "pt-1 text-[10px] xl:text-[9px]"
                : "pt-1 text-[11px] sm:pt-2 sm:text-xs"
            }`}
          >
            Deadline har passerat
          </div>
        )}
      </div>
    </div>
  );
}