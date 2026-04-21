type Props = {
  paidCount: number;
  totalCount?: number;
};

export default function AdminPaidMembersNotice({
  paidCount,
  totalCount,
}: Props) {
  return (
    <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-4 sm:p-5 backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
            Admin
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Betalande medlemmar
          </h3>
          <p className="mt-2 text-sm text-white/70">
            {totalCount != null
              ? `${paidCount} av ${totalCount} deltagare har betalat.`
              : `${paidCount} deltagare har betalat.`}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
          <div className="text-2xl font-extrabold text-white">{paidCount}</div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/55">
            betalda
          </div>
        </div>
      </div>
    </div>
  );
}