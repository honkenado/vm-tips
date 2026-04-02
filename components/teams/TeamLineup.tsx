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
          <div className="relative mx-auto h-[520px] w-full max-w-[860px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-[#1f6a3d] via-[#175433] to-[#103a24] shadow-inner">
            {/* Mjuk grässtruktur */}
            <div className="absolute inset-0 opacity-[0.08]">
              <div className="h-full w-full bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.35)_50%,transparent_100%)] bg-[length:100%_74px]" />
            </div>

            {/* Yttre planlinje */}
            <div className="absolute inset-3 rounded-[1.25rem] border border-white/20" />

            {/* Mittlinje - horisontell eftersom planen spelas nedifrån och upp */}
            <div className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-white/20" />

            {/* Mittcirkel */}
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

            {/* Mittpunkt */}
            <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />

            {/* Övre straffområde */}
            <div className="absolute left-1/2 top-3 h-[112px] w-[220px] -translate-x-1/2 border-x border-b border-white/20" />
            <div className="absolute left-1/2 top-3 h-[50px] w-[92px] -translate-x-1/2 border-x border-b border-white/20" />
            <div className="absolute left-1/2 top-[86px] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white/70" />

            {/* Nedre straffområde */}
            <div className="absolute bottom-3 left-1/2 h-[112px] w-[220px] -translate-x-1/2 border-x border-t border-white/20" />
            <div className="absolute bottom-3 left-1/2 h-[50px] w-[92px] -translate-x-1/2 border-x border-t border-white/20" />
            <div className="absolute bottom-[86px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white/70" />

            {/* Mål */}
            <div className="absolute left-1/2 top-0 h-3 w-[84px] -translate-x-1/2 rounded-b-md border-x border-b border-white/20 bg-white/5" />
            <div className="absolute bottom-0 left-1/2 h-3 w-[84px] -translate-x-1/2 rounded-t-md border-x border-t border-white/20 bg-white/5" />

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
                  <div className="flex w-[96px] flex-col items-center">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full border text-[11px] font-black shadow-lg backdrop-blur-sm ${
                        isFilled
                          ? "border-slate-200 bg-white text-slate-900"
                          : "border-white/20 bg-white/15 text-white/80"
                      }`}
                    >
                      {player?.shirtNumber ?? slot.roleLabel}
                    </div>

                    <div className="mt-1.5 max-w-[96px] text-center text-[11px] font-semibold leading-tight text-white drop-shadow-sm">
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