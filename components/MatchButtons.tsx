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
      className={`bg-white/95 shadow-sm backdrop-blur-sm ${
        compact
          ? "w-[152px] rounded-xl border-2 border-slate-300/90 p-1.5 shadow-[0_6px_18px_rgba(15,23,42,0.08)]"
          : "rounded-2xl border border-slate-300 p-4"
      }`}
    >
      {match.label ? (
        <div
          className={`font-bold uppercase tracking-wide text-slate-500 ${
            compact ? "mb-1 text-[9px] leading-none" : "mb-3 text-xs"
          }`}
        >
          {match.label}
        </div>
      ) : null}

      <div className={compact ? "grid gap-1" : "grid gap-1.5"}>
        <button
          disabled={homeDisabled}
          onClick={() => onSelectWinner(match.id, match.home)}
          className={`font-semibold transition ${
            compact
              ? "min-h-[24px] rounded-lg px-2 py-0.5 text-[11px]"
              : "rounded-xl px-4 py-3"
          } ${
            chosenHome
              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_6px_14px_rgba(5,150,105,0.28)]"
              : "border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-900 hover:from-slate-100 hover:to-slate-200"
          } ${homeDisabled ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <span className="block truncate text-center leading-tight">
            {match.home || "Väntar..."}
          </span>
        </button>

        <div
          className={`text-center font-semibold uppercase tracking-wide text-slate-400 ${
            compact ? "text-[8px] leading-none" : "text-xs"
          }`}
        >
          vs
        </div>

        <button
          disabled={awayDisabled}
          onClick={() => onSelectWinner(match.id, match.away)}
          className={`font-semibold transition ${
            compact
              ? "min-h-[24px] rounded-lg px-2 py-0.5 text-[11px]"
              : "rounded-xl px-4 py-3"
          } ${
            chosenAway
              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_6px_14px_rgba(5,150,105,0.28)]"
              : "border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-900 hover:from-slate-100 hover:to-slate-200"
          } ${awayDisabled ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <span className="block truncate text-center leading-tight">
            {match.away || "Väntar..."}
          </span>
        </button>

        {deadlinePassed && (
          <div
            className={`text-center font-medium text-rose-500 ${
              compact ? "pt-1 text-[9px]" : "pt-2 text-xs"
            }`}
          >
            Deadline har passerat
          </div>
        )}
      </div>
    </div>
  );
}