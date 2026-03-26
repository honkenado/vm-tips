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
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_14px_40px_rgba(15,23,42,0.10)] backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-500" />

      <div className="border-b border-slate-200 bg-gradient-to-r from-white via-slate-50 to-white px-5 py-5 md:px-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>

      <div className="bg-gradient-to-b from-white to-slate-50 px-4 py-5 md:px-6 md:py-6">
        {children}
      </div>
    </section>
  );
}