import Link from "next/link";
import { headers } from "next/headers";
import MembersListSection from "@/components/MembersListSection";

type MembersResponse = {
  members?: Array<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: string | null;
    display_name: string;
    member_number: number;
  }>;
  error?: string;
};

async function getMembersCount() {
  try {
    const headerStore = await headers();
    const host = headerStore.get("host");

    if (!host) return 0;

    const protocol = host.includes("localhost") ? "http" : "https";

    const res = await fetch(`${protocol}://${host}/api/members`, {
      cache: "no-store",
    });

    if (!res.ok) return 0;

    const data = (await res.json()) as MembersResponse;
    return data.members?.length ?? 0;
  } catch {
    return 0;
  }
}

export default async function MembersPage() {
  const membersCount = await getMembersCount();

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            ← Till startsidan
          </Link>
        </div>

        <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-7">
          <div className="pointer-events-none absolute -left-20 top-0 h-[220px] w-[220px] rounded-full bg-emerald-500/10 blur-[90px]" />
          <div className="pointer-events-none absolute right-[-40px] top-6 h-[180px] w-[180px] rounded-full bg-emerald-400/8 blur-[80px]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.12),rgba(2,6,23,0)_35%,rgba(2,6,23,0)_65%,rgba(16,185,129,0.05))]" />

          <div className="relative">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-400">
              Addes VM-tips
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Medlemmar
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
              Här ser du alla som registrerat sig i årets VM-tips. Ju fler vi
              blir, desto roligare blir tabellen, ligorna och snacket.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-xl">
                <div className="text-3xl font-black text-white">{membersCount}</div>
                <div className="mt-1 text-sm text-white/70">registrerade deltagare</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-xl">
                <div className="text-3xl font-black text-white">🔥</div>
                <div className="mt-1 text-sm text-white/70">
                  fullt tryck inför VM 2026
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-xl">
                <div className="text-3xl font-black text-white">🏆</div>
                <div className="mt-1 text-sm text-white/70">
                  tävla i huvudligan och kompisligor
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/tips"
                className="rounded-full bg-emerald-500/95 px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)] transition hover:bg-emerald-400"
              >
                Gå till tipset
              </Link>

              <Link
                href="/league"
                className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                Se ligor
              </Link>
            </div>
          </div>
        </section>

        <MembersListSection />
      </div>
    </main>
  );
}