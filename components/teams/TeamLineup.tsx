import type { TeamLineupSlot } from "@/types/team";

export default function TeamLineup({
  formation,
  slots,
}: {
  formation: string | null;
  slots: TeamLineupSlot[];
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Trolig startelva
          </h2>
          <p className="text-sm text-slate-600">
            Grafisk laguppställning baserad på sparad formation.
          </p>
        </div>

        <div className="inline-flex w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
          Formation: {formation ?? "–"}
        </div>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          Ingen uppställning sparad ännu.
        </div>
      ) : (
        <div className="rounded-[2rem] border border-slate-200 bg-[#0f2431] p-4 md:p-5">
          <div className="relative mx-auto h-[520px] w-full max-w-[860px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-[#17384a] to-[#0d1f2b]">
            {/* Plan */}
            <div className="absolute inset-3 rounded-[1.25rem] border border-white/10" />
            <div className="absolute left-1/2 top-3 h-[100px] w-[190px] -translate-x-1/2 rounded-b-[18px] border-x border-b border-white/15" />
            <div className="absolute left-1/2 top-3 h-[42px] w-[78px] -translate-x-1/2 rounded-b-[10px] border-x border-b border-white/15" />
            <div className="absolute bottom-3 left-1/2 h-[100px] w-[190px] -translate-x-1/2 rounded-t-[18px] border-x border-t border-white/15" />
            <div className="absolute bottom-3 left-1/2 h-[42px] w-[78px] -translate-x-1/2 rounded-t-[10px] border-x border-t border-white/15" />
            <div className="absolute left-1/2 top-1/2 h-full w-px -translate-x-1/2 bg-white/10" />
            <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12" />

            {slots.map((slot) => {
              const player = slot.player;
              const isFilled = !!player;

              return (
                <div
                  key={slot.slotKey}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${slot.xPos}%`,
                    top: `${slot.yPos}%`,
                  }}
                >
                  <div className="flex w-[92px] flex-col items-center">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full border text-[11px] font-black shadow-md ${
                        isFilled
                          ? "border-slate-200 bg-white text-slate-900"
                          : "border-white/20 bg-white/15 text-white/80"
                      }`}
                    >
                      {player?.shirtNumber ?? slot.roleLabel}
                    </div>

                    <div className="mt-1 max-w-[92px] text-center text-[11px] font-semibold leading-tight text-white">
                      {player?.name ?? slot.roleLabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}