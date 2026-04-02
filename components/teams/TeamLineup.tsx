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
        <div className="rounded-[2rem] border border-slate-200 bg-[#10212b] p-4 md:p-6">
          <div className="relative mx-auto h-[560px] w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-[#163344] via-[#102734] to-[#0a1720]">
            {/* Yttre linjer */}
            <div className="absolute inset-4 rounded-[1.25rem] border border-white/10" />

            {/* Mittlinje */}
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/15" />

            {/* Mittcirkel */}
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

            {/* Straffområde upp */}
            <div className="absolute left-1/2 top-4 h-[90px] w-[220px] -translate-x-1/2 rounded-b-[16px] border-x border-b border-white/20" />
            <div className="absolute left-1/2 top-4 h-[42px] w-[100px] -translate-x-1/2 rounded-b-[12px] border-x border-b border-white/20" />
            <div className="absolute left-1/2 top-[96px] h-20 w-20 -translate-x-1/2 rounded-full border border-white/10" />

            {/* Straffområde ned */}
            <div className="absolute bottom-4 left-1/2 h-[90px] w-[220px] -translate-x-1/2 rounded-t-[16px] border-x border-t border-white/20" />
            <div className="absolute bottom-4 left-1/2 h-[42px] w-[100px] -translate-x-1/2 rounded-t-[12px] border-x border-t border-white/20" />
            <div className="absolute bottom-[96px] left-1/2 h-20 w-20 -translate-x-1/2 rounded-full border border-white/10" />

            {/* Hörnmarkeringar */}
            <div className="absolute left-4 top-4 h-4 w-4 rounded-br-full border-b border-r border-white/20" />
            <div className="absolute right-4 top-4 h-4 w-4 rounded-bl-full border-b border-l border-white/20" />
            <div className="absolute bottom-4 left-4 h-4 w-4 rounded-tr-full border-r border-t border-white/20" />
            <div className="absolute bottom-4 right-4 h-4 w-4 rounded-tl-full border-l border-t border-white/20" />

            {slots.map((slot) => {
              const hasPlayer = !!slot.player;

              return (
                <div
                  key={slot.slotKey}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${slot.xPos}%`,
                    top: `${slot.yPos}%`,
                  }}
                >
                  <div className="flex w-[110px] flex-col items-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-xs font-black shadow-lg transition ${
                        hasPlayer
                          ? "border-blue-500 bg-white text-slate-900"
                          : "border-white/40 bg-slate-200 text-slate-700 opacity-80"
                      }`}
                    >
                      {slot.player?.shirtNumber ?? slot.roleLabel}
                    </div>

                    <div className="mt-1 text-center">
                      <div className="text-[11px] font-semibold leading-tight text-white">
                        {slot.player?.name ?? slot.roleLabel}
                      </div>
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