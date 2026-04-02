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

        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
          Formation: {formation ?? "–"}
        </div>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          Ingen uppställning sparad ännu.
        </div>
      ) : (
        <div className="rounded-[2rem] border border-slate-200 bg-[#10212b] p-4">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#183140] to-[#0b1820]">
            <div className="absolute inset-x-[12%] top-[6%] h-[18%] rounded-b-[999px] border-x border-b border-white/20" />
            <div className="absolute inset-x-[22%] top-[0%] h-[10%] rounded-b-[14px] border-x border-b border-white/20" />
            <div className="absolute left-1/2 top-[50%] h-[1px] w-full -translate-x-1/2 bg-white/15" />
            <div className="absolute left-1/2 top-[50%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
            <div className="absolute inset-x-[12%] bottom-[6%] h-[18%] rounded-t-[999px] border-x border-t border-white/20" />
            <div className="absolute inset-x-[22%] bottom-[0%] h-[10%] rounded-t-[14px] border-x border-t border-white/20" />

            {slots.map((slot) => (
              <div
                key={slot.slotKey}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${slot.xPos}%`,
                  top: `${slot.yPos}%`,
                }}
              >
                <div className="flex w-[110px] flex-col items-center gap-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white text-xs font-bold text-black shadow-md">
                    {slot.player?.shirtNumber ?? slot.roleLabel}
                  </div>

                  <div className="text-center text-xs font-medium text-white">
                    {slot.player?.name ?? slot.roleLabel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}