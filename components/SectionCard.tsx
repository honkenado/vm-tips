import type { ReactNode } from "react";

export default function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-[0_14px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:rounded-[2rem]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
      <div className="pointer-events-none absolute -left-16 top-0 h-32 w-32 rounded-full bg-emerald-500/8 blur-3xl" />

      <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(16,185,129,0.10),rgba(255,255,255,0.02)_35%,rgba(255,255,255,0.02)_65%,rgba(16,185,129,0.04))] px-4 py-4 sm:px-5 sm:py-5 md:px-6">
        <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
          {title}
        </h2>

        {subtitle ? (
          <p className="mt-1 text-sm leading-5 text-white/68">{subtitle}</p>
        ) : null}
      </div>

      <div className="bg-transparent px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
        {children}
      </div>
    </section>
  );
}