import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import NewsPreview from "@/components/NewsPreview";
import { getGroupStageSchedule } from "@/lib/match-schedule";
import { getUpcomingMatches } from "@/lib/match-utils";
import AuthStatus from "@/components/auth-status";

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

function getDeadlineDate() {
  const now = new Date();
  const year = now.getFullYear();
  return new Date(year, 5, 10, 23, 59, 59);
}

function getDaysLeftToDeadline() {
  const now = new Date();
  const deadline = getDeadlineDate();
  const diff = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function isBeforeDeadline() {
  return new Date().getTime() <= getDeadlineDate().getTime();
}

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile:
  | {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      payment_code: string | null;
      payment_status: string | null;
      role: string | null;
      is_admin: boolean | null;
    }
  | null = null;

if (user) {
  const profileColumns =
    "first_name, last_name, email, payment_code, payment_status, role, is_admin";

  const { data: profileById } = await supabase
    .from("profiles")
    .select(profileColumns)
    .eq("id", user.id)
    .maybeSingle();

  if (profileById) {
    profile = profileById;
  } else if (user.email) {
    const { data: profileByEmail } = await supabase
      .from("profiles")
      .select(profileColumns)
      .eq("email", user.email)
      .maybeSingle();

    profile = profileByEmail;
  }
}

  const beforeDeadline = isBeforeDeadline();
  const daysLeft = getDaysLeftToDeadline();

  const schedule = getGroupStageSchedule();
  const upcomingMatches = getUpcomingMatches(schedule);

  const openingMatch = schedule.length > 0 ? schedule[0] : null;
  const nextUpcomingMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;

  const featuredMatch = beforeDeadline
    ? openingMatch || nextUpcomingMatch
    : nextUpcomingMatch || openingMatch;

  let registeredCount = 0;

  try {
    const headerStore = await headers();
    const host = headerStore.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    if (host) {
      const membersRes = await fetch(`${protocol}://${host}/api/members`, {
        cache: "no-store",
      });

      if (membersRes.ok) {
        const membersData = (await membersRes.json()) as MembersResponse;
        registeredCount = membersData.members?.length ?? 0;
      }
    }
  } catch (error) {
    console.error("Kunde inte hämta members count", error);
  }

  const displayName =
  [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
  profile?.email ||
  user?.email ||
  "Deltagare";

  const isLoggedIn = !!user;
  const isAdmin = profile?.role === "admin" || profile?.is_admin === true;

  const mobileHeaderNote = beforeDeadline
    ? `${daysLeft} dagar kvar till deadline`
    : featuredMatch
    ? `Nästa match: ${featuredMatch.homeTeam} - ${featuredMatch.awayTeam}`
    : "VM-tipset är öppet";

  const navItems = [
    { href: "/rules", label: "Regler" },
    { href: "/help", label: "Hjälp" },
    { href: "/medlemmar", label: "Medlemmar" },
    { href: "/league", label: "Ligor" },
    { href: "/lag", label: "Lag & spelare" },
    { href: "/tv-guide", label: "TV-guide" },
  ];

  return (
    <main className="min-h-screen bg-[#020617] pb-24 md:pb-0">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 md:px-6">
        <div className="mb-3 md:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white/90">
                {isLoggedIn ? displayName : "Addes VM-tips"}
              </div>

              {isLoggedIn && isAdmin ? (
                <Link
                  href="/admin"
                  className="mt-2 inline-flex rounded-full border border-emerald-400/25 bg-emerald-500/12 px-3 py-1.5 text-[11px] font-bold text-emerald-100 transition hover:bg-emerald-500/20"
                >
                  Admin
                </Link>
              ) : null}
            </div>

            <div className="ml-3 flex shrink-0 items-center gap-2">
              {isLoggedIn ? (
                <AuthStatus />
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/[0.1]"
                  >
                    Logga in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-900 transition hover:bg-slate-100"
                  >
                    Skapa konto
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/80 backdrop-blur-xl">
            {mobileHeaderNote}
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/6 bg-[#020617] text-white shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
          <div className="pointer-events-none absolute -left-28 -top-24 h-[420px] w-[420px] rounded-full bg-emerald-500/14 blur-[140px]" />
          <div className="pointer-events-none absolute left-[18%] top-[58%] h-[280px] w-[280px] rounded-full bg-emerald-400/6 blur-[120px]" />
          <div className="pointer-events-none absolute -right-24 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-emerald-300/8 blur-[120px]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02),transparent_35%,transparent_65%,rgba(16,185,129,0.03))]" />

          <div className="relative grid gap-4 p-4 md:grid-cols-[1.4fr_0.9fr] md:gap-5 md:p-6 xl:p-8">
            <div className="flex flex-col gap-4 md:gap-5">
              <div>
                <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur-xl">
                  FIFA World Cup 2026
                </span>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl md:h-24 md:w-24">
                    <img
                      src="/logo.png"
                      alt="Addes VM-tips"
                      className="h-16 w-16 object-contain md:h-20 md:w-20"
                    />
                  </div>
                </div>

                <div className="max-w-3xl">
                  <h1 className="text-[2.75rem] font-black leading-[0.95] tracking-tight text-white md:text-6xl xl:text-7xl">
                    Välkommen till
                    <br />
                    Addes VM-tips
                  </h1>

                  <p className="mt-4 max-w-2xl text-base leading-8 text-white/90 md:text-lg">
                    Lägg dina tips, följ spänningen i fotbolls-VM och tävla mot
                    andra om ära, poäng och topplaceringar i tabellen.
                  </p>

                  <p className="mt-2 text-sm leading-7 text-white/78">
                    Tippa gruppspel, slutspel och hela vägen fram till världsmästaren.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3 md:flex md:flex-wrap">
                    <Link
                      href="/medlemmar"
                      className="relative z-10 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-white/20 hover:bg-white/[0.08] md:hidden"
                    >
                      <div className="text-3xl font-black text-white">{registeredCount}</div>
                      <div className="text-sm text-white/75">registrerade</div>
                    </Link>

                    <Link
                      href="/medlemmar"
                      className="relative z-10 hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-white/20 hover:bg-white/[0.08] md:block"
                    >
                      <div className="text-3xl font-black text-white">{registeredCount}</div>
                      <div className="text-sm text-white/75">registrerade</div>
                    </Link>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <div className="text-3xl font-black text-white">{daysLeft}</div>
                      <div className="text-sm text-white/75">dagar kvar</div>
                    </div>

                    <div className="hidden min-w-[110px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:block">
                      <div className="text-lg font-black text-white">
                        {featuredMatch ? featuredMatch.date : "-"}
                      </div>
                      <div className="text-sm text-white/75">
                        {beforeDeadline ? "öppningsmatch" : "nästa match"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 md:mt-7">
                    {isLoggedIn ? (
                      <Link
                        href="/tips"
                        className="flex w-full items-center justify-center rounded-2xl bg-emerald-500/95 px-8 py-4 text-lg font-bold text-white shadow-[0_12px_30px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400 md:inline-flex md:min-w-[240px] md:w-auto md:py-3.5 md:text-base"
                      >
                        Gå till tipset
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        className="flex w-full items-center justify-center rounded-2xl bg-emerald-500/95 px-8 py-4 text-lg font-bold text-white shadow-[0_12px_30px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400 md:inline-flex md:min-w-[240px] md:w-auto md:py-3.5 md:text-base"
                      >
                        Logga in
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden pt-2 md:block">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-white/48">
                  Navigation
                </p>

                <div className="flex flex-wrap gap-2.5">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08]"
                    >
                      {item.label}
                    </Link>
                  ))}

                  {isLoggedIn ? (
                    <Link
                      href="/mitt-resultat"
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08]"
                    >
                      Mitt resultat
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="hidden md:flex md:flex-col md:gap-3">
              {isLoggedIn ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                  <AuthStatus />

                  {isAdmin ? (
                    <Link
                      href="/admin"
                      className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/12 px-4 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/20"
                    >
                      Adminpanel
                    </Link>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                  <h2 className="text-lg font-black text-white">Redo att vara med?</h2>
                  <p className="mt-2 text-sm text-white/82">
                    Logga in för att lägga ditt tips, följa ditt resultat och värva
                    vänner till ligan.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href="/login"
                      className="rounded-xl bg-emerald-500/95 px-4 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)] transition hover:bg-emerald-400"
                    >
                      Logga in
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white transition hover:bg-white/[0.1]"
                    >
                      Skapa konto
                    </Link>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xl font-black text-white">Nästa match</h2>

                  <Link
                    href="/tv-guide"
                    className="text-xs font-semibold text-white/72 hover:text-white hover:underline"
                  >
                    Se allt
                  </Link>
                </div>

                {featuredMatch ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-base font-black text-white">
                      {featuredMatch.homeTeam} - {featuredMatch.awayTeam}
                    </div>

                    <div className="mt-1 text-xs text-white/82">
                      {featuredMatch.date} · {featuredMatch.time}
                    </div>

                    <div className="mt-1 text-xs text-white/72">
                      {featuredMatch.groupName}
                    </div>

                    <div className="mt-1 text-xs text-white/82">
                      {featuredMatch.tvChannel || "TV-kanal saknas"}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/72">
                    Ingen match hittades i spelschemat
                  </div>
                )}

                <Link
                  href="/tv-guide"
                  className="mt-3 block w-full rounded-xl bg-white/[0.07] py-2.5 text-center text-sm font-bold text-white transition hover:bg-white/[0.11]"
                >
                  TV-guide
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4">
          <NewsPreview />
        </div>
      </div>
    </main>
  );
}