import Link from "next/link";
import MembersListSection from "@/components/MembersListSection";

export default function MembersPage() {
  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl">
        
        {/* 🔙 Tillbaka */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            ← Till startsidan
          </Link>
        </div>

        {/* 🔥 HEADER */}
        <section className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-400">
            Addes VM-tips
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Medlemmar
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-white/75">
            Här ser du alla användare som har registrerat sig i appen.
          </p>
        </section>

        {/* 👥 LISTA */}
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <MembersListSection />
        </section>

      </div>
    </main>
  );
}