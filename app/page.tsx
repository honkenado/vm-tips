import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import NewsPreview from "@/components/NewsPreview";
import { getGroupStageSchedule } from "@/lib/match-schedule";
import { getUpcomingMatches } from "@/lib/match-utils";

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

type PredictionRow = {
  group_stage?: Array<{
    name: string;
    matches: Array<{
      id: number;
      homeGoals: string;
      awayGoals: string;
    }>;
  }> | null;
  knockout?: Record<string, string> | null;
  golden_boot?: string | null;
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

function countGroupProgress(
  groupStage:
    | Array<{
        name: string;
        matches: Array<{ id: number; homeGoals: string; awayGoals: string }>;
      }>
    | undefined
    | null
) {
  if (!groupStage?.length) {
    return { total: 72, completed: 0 };
  }

  const total = groupStage.reduce((sum, group) => sum + group.matches.length, 0);
  const completed = groupStage.reduce(
    (sum, group) =>
      sum +
      group.matches.filter(
        (match) => match.homeGoals !== "" && match.awayGoals !== ""
      ).length,
    0
  );

  return { total, completed };
}

function countKnockoutProgress(knockout: Record<string, string> | undefined | null) {
  const completed = knockout
    ? Object.values(knockout).filter(
        (winner) => typeof winner === "string" && winner.trim() !== ""
      ).length
    : 0;

  return { total: 32, completed };
}

function buildStatusText(params: {
  groupCompleted: number;
  groupTotal: number;
  knockoutCompleted: number;
  knockoutTotal: number;
  goldenBootDone: number;
}) {
  const {
    groupCompleted,
    groupTotal,
    knockoutCompleted,
    knockoutTotal,
    goldenBootDone,
  } = params;

  if (groupCompleted < groupTotal) {
    const left = groupTotal - groupCompleted;
    return `Du har ${left} gruppmatcher kvar att fylla i.`;
  }

  if (knockoutCompleted < knockoutTotal) {
    const left = knockoutTotal - knockoutCompleted;
    return `Du har ${left} slutspelsval kvar att fylla i.`;
  }

  if (!goldenBootDone) {
    return "Du saknar fortfarande skyttekung.";
  }

  return "Ditt tips ser komplett ut.";
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
        is_admin: boolean | null;
      }
    | null = null;

  let prediction: PredictionRow | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name, email, payment_code, payment_status, is_admin")
      .eq("id", user.id)
      .single();

    profile = data;

    const { data: predictionData } = await supabase
      .from("predictions")
      .select("group_stage, knockout, golden_boot")
      .eq("user_id", user.id)
      .maybeSingle();

    prediction = (predictionData as PredictionRow | null) ?? null;
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
    "Deltagare";

  const isLoggedIn = !!user;
  const isPaid = profile?.payment_status === "paid";

  const groupProgress = countGroupProgress(prediction?.group_stage);
  const knockoutProgress = countKnockoutProgress(prediction?.knockout);
  const goldenBootDone = prediction?.golden_boot?.trim() ? 1 : 0;

  const totalProgressItems = groupProgress.total + knockoutProgress.total + 1;
  const completedProgressItems =
    groupProgress.completed + knockoutProgress.completed + goldenBootDone;

  const progressPercent =
    totalProgressItems > 0
      ? Math.round((completedProgressItems / totalProgressItems) * 100)
      : 0;

  const statusText = buildStatusText({
    groupCompleted: groupProgress.completed,
    groupTotal: groupProgress.total,
    knockoutCompleted: knockoutProgress.completed,
    knockoutTotal: knockoutProgress.total,
    goldenBootDone,
  });

  const navItems = [
    { href: "/rules", label: "Regler" },
    { href: "/help", label: "Hjälp" },
    { href: "/medlemmar", label: "Medlemmar" },
    { href: "/league", label: "Ligor" },
    { href: "/lag", label: "Lag & spelare" },
    { href: "/tv-guide", label: "TV-guide" },
  ];

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 md:px-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#020617] text-white shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
          <div className="pointer-events-none absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="pointer-events-none absolute right-[-120px] top-1/2 h-[320px] w-[320px] -translate-y-1/2 rounded-full bg-emerald-400/10 blur-[110px]" />

          <div className="relative grid gap-5 p-5 md:grid-cols-[1.4fr_0.9fr] md:p-6 xl:p-8">
            <div className="flex flex-col gap-5">
              <div>
                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                  FIFA World Cup 2026
                </span>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-xl backdrop-blur-xl md:h-24 md:w-24">
                    <img
                      src="/logo.png"
                      alt="Addes VM-tips"
                      className="h-16 w-16 object-contain md:h-20 md:w-20"
                    />
                  </div>
                </div>

                <div className="max-w-3xl">
                  <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-white md:text-6xl xl:text-7xl">
                    Välkommen till
                    <br />
                    Addes VM-tips
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 md:text-lg">
                    Lägg dina tips, följ spänningen i fotbolls-VM och tävla mot
                    andra om ära, poäng och topplaceringar i tabellen.
                  </p>

                  <p className="mt-2 text-sm text-white/75">
                    Tippa gruppspel, slutspel och hela vägen fram till världsmästaren.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="min-w-[110px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                      <div className="text-3xl font-black">{registeredCount}</div>
                      <div className="text-sm text-white/75">registrerade</div>
                    </div>

                    <div className="min-w-[110px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                      <div className="text-3xl font-black">{daysLeft}</div>
                      <div className="text-sm text-white/75">dagar kvar</div>
                    </div>

                    <div className="min-w-[110px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                      <div className="text-lg font-black">{featuredMatch ? featuredMatch.date : "-"}</div>
                      <div className="text-sm text-white/75">
                        {beforeDeadline ? "öppningsmatch" : "nästa match"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-7">
                    {isLoggedIn ? (
                      <Link
                        href="/tips"
                        className="inline-flex min-w-[240px] items-center justify-center rounded-2xl bg-emerald-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400"
                      >
                        Gå till tipset
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        className="inline-flex min-w-[240px] items-center justify-center rounded-2xl bg-emerald-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400"
                      >
                        Logga in
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-white/50">
                  Navigation
                </p>

                <div className="flex flex-wrap gap-2.5">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10"
                    >
                      {item.label}
                    </Link>
                  ))}

                  {isLoggedIn ? (
                    <Link
                      href="/mitt-resultat"
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10"
                    >
                      Mitt resultat
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {isLoggedIn ? (
                <div className="flex flex-col items-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-white shadow-lg backdrop-blur-xl md:items-end">
                  <div className="text-xs text-white/80">{displayName}</div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-bold text-white">
                      {profile?.payment_code || "Ingen kod"}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-bold ${
                        isPaid
                          ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                          : "border-amber-400/40 bg-amber-500/15 text-amber-100"
                      }`}
                    >
                      {isPaid ? "Betald" : "Ej betald"}
                    </span>
                  </div>

                  <div className="w-full rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-50">
                    Swisha 170 kr och märk med kod{" "}
                    <span className="font-extrabold">{profile?.payment_code || "kod"}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {profile?.is_admin ? (
                      <Link
                        href="/admin"
                        className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-400"
                      >
                        Admin
                      </Link>
                    ) : null}

                    <form action="/auth/signout" method="post">
                      <button
                        type="submit"
                        className="rounded-lg border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/12"
                      >
                        Logga ut
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white shadow-lg backdrop-blur-xl">
                  <h2 className="text-lg font-black text-white">Redo att vara med?</h2>
                  <p className="mt-2 text-sm text-white/80">
                    Logga in för att lägga ditt tips, följa ditt resultat och värva
                    vänner till ligan.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href="/login"
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-400"
                    >
                      Logga in
                    </Link>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white shadow-lg backdrop-blur-xl">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xl font-black text-white">Nästa match</h2>

                  <Link
                    href="/tv-guide"
                    className="text-xs font-semibold text-white/70 hover:text-white hover:underline"
                  >
                    Se allt
                  </Link>
                </div>

                {featuredMatch ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-base font-black text-white">
                      {featuredMatch.homeTeam} - {featuredMatch.awayTeam}
                    </div>

                    <div className="mt-1 text-xs text-white/80">
                      {featuredMatch.date} · {featuredMatch.time}
                    </div>

                    <div className="mt-1 text-xs text-white/75">
                      {featuredMatch.groupName}
                    </div>

                    <div className="mt-1 text-xs text-white/80">
                      {featuredMatch.tvChannel || "TV-kanal saknas"}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                    Ingen match hittades i spelschemat
                  </div>
                )}

                <Link
                  href="/tv-guide"
                  className="mt-3 block w-full rounded-xl bg-white/8 py-2.5 text-center text-sm font-bold text-white transition hover:bg-white/12"
                >
                  TV-guide
                </Link>
              </div>

              {isLoggedIn && beforeDeadline ? (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white shadow-lg backdrop-blur-xl">
                    <h2 className="text-lg font-black text-white">Din status</h2>

                    <div className="mt-2 text-xs text-white/80">{statusText}</div>

                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="mt-1 text-xs font-semibold text-white/85">
                      {progressPercent}%
                    </div>

                    <div className="mt-4">
                      <Link
                        href="/tips"
                        className="block rounded-xl bg-emerald-500 py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-400"
                      >
                        Gå till tipset
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/90 shadow-md backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-black text-white">Värva</h2>
                        <p className="mt-1 text-xs text-white/75">
                          Bjud in fler till ligan före deadline.
                        </p>
                      </div>

                      <Link
                        href="/varva"
                        className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-400"
                      >
                        Öppna
                      </Link>
                    </div>
                  </div>
                </>
              ) : null}
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