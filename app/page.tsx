import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createReadOnlyClient } from "@/lib/supabase/server-readonly";
import NewsPreview from "@/components/NewsPreview";

type MatchItem = {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  group_name?: string | null;
  tv_channel?: string | null;
  tv_stream?: string | null;
};

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

function formatShortDate(dateString: string | null) {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
  }).format(new Date(dateString));
}

function formatTime(dateString: string | null) {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function getDaysLeftToDeadline() {
  const now = new Date();
  const year = now.getFullYear();
  const deadline = new Date(year, 5, 10, 23, 59, 59);
  const diff = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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
  const readOnlySupabase = await createReadOnlyClient();

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

  const nowIso = new Date().toISOString();

  const { data: upcomingMatches } = await readOnlySupabase
    .from("matches")
    .select("id, home_team, away_team, match_date, group_name, tv_channel, tv_stream")
    .gt("match_date", nowIso)
    .order("match_date", { ascending: true })
    .limit(1);

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

  const nextMatch = ((upcomingMatches ?? [])[0] ?? null) as MatchItem | null;

  const daysLeft = getDaysLeftToDeadline();

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

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 md:px-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.45),_rgba(15,23,42,1)_75%)] text-white shadow-xl">
          <div className="grid gap-4 p-5 md:grid-cols-[1.35fr_0.85fr] md:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85">
                  FIFA World Cup 2026
                </span>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-lg md:h-24 md:w-24">
                    <img
                      src="/logo.png"
                      alt="Addes VM-tips"
                      className="h-16 w-16 object-contain md:h-20 md:w-20"
                    />
                  </div>
                </div>

                <div className="max-w-3xl">
                  <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
                    Välkommen till Addes VM-tips
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm text-white/85 md:text-lg">
                    Lägg dina tips, följ spänningen i fotbolls-VM och tävla mot
                    andra om ära, poäng och topplaceringar i tabellen.
                  </p>

                  <p className="mt-2 text-sm text-white/70">
                    Tippa gruppspel, slutspel och hela vägen fram till världsmästaren.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-sm">
                      <div className="text-2xl font-extrabold">{registeredCount}</div>
                      <div className="text-sm text-white/80">registrerade</div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-sm">
                      <div className="text-2xl font-extrabold">{daysLeft}</div>
                      <div className="text-sm text-white/80">dagar kvar</div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-sm">
                      <div className="text-2xl font-extrabold">
                        {nextMatch ? formatShortDate(nextMatch.match_date) : "-"}
                      </div>
                      <div className="text-sm text-white/80">nästa match</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    {isLoggedIn ? (
                      <Link
                        href="/tips"
                        className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-emerald-500 px-8 py-3 text-base font-bold text-white transition hover:bg-emerald-400"
                      >
                        Gå till tipset
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-emerald-500 px-8 py-3 text-base font-bold text-white transition hover:bg-emerald-400"
                      >
                        Logga in
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                  Navigation
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    { href: "/rules", label: "Regler" },
                    { href: "/help", label: "Hjälp" },
                    { href: "/medlemmar", label: "Medlemmar" },
                    { href: "/league", label: "Ligor" },
                    { href: "/lag", label: "Lag & spelare" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/15"
                    >
                      {item.label}
                    </Link>
                  ))}

                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/mitt-resultat"
                        className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/15"
                      >
                        Mitt resultat
                      </Link>
                      <Link
                        href="/varva"
                        className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/15"
                      >
                        Värva medlemmar
                      </Link>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {isLoggedIn ? (
                <div className="flex flex-col items-start gap-2 rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-4 shadow-lg md:items-end">
                  <div className="text-xs text-white/80">{displayName}</div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-white">
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
                    <span className="font-extrabold">
                      {profile?.payment_code || "kod"}
                    </span>
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
                        className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/15"
                      >
                        Logga ut
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-4 shadow-lg">
                  <h2 className="text-lg font-black text-white">Redo att vara med?</h2>
                  <p className="mt-2 text-sm text-white/75">
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

              <div className="rounded-[1.5rem] bg-white p-4 text-slate-900 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xl font-black">Nästa match</h2>

                  <Link
                    href="/matcher-idag"
                    className="text-xs font-semibold text-slate-600 hover:underline"
                  >
                    Se allt
                  </Link>
                </div>

                {nextMatch ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-base font-black">
                      {nextMatch.home_team} - {nextMatch.away_team}
                    </div>

                    <div className="text-xs text-slate-500">
                      {formatShortDate(nextMatch.match_date)} ·{" "}
                      {formatTime(nextMatch.match_date)}
                    </div>

                    <div className="mt-1 text-xs text-slate-600">
                      {nextMatch.tv_channel || "TBA"}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                    Inga matcher just nu
                  </div>
                )}

                <Link
                  href="/matcher-idag"
                  className="mt-3 block w-full rounded-xl bg-slate-900 py-2 text-center text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Matchschema
                </Link>
              </div>

              {isLoggedIn ? (
                <>
                  <div className="rounded-[1.5rem] bg-white p-4 text-slate-900 shadow-lg">
                    <h2 className="text-lg font-black">Din status</h2>

                    <div className="mt-2 text-xs text-slate-500">{statusText}</div>

                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="mt-1 text-xs font-semibold">{progressPercent}%</div>

                    <div className="mt-3 flex flex-col gap-2">
                      <Link
                        href="/tips"
                        className="rounded-xl bg-emerald-500 py-2 text-center text-sm font-bold text-white transition hover:bg-emerald-400"
                      >
                        Gå till tipset
                      </Link>

                      <Link
                        href="/league"
                        className="rounded-xl bg-slate-900 py-2 text-center text-sm font-bold text-white transition hover:bg-slate-800"
                      >
                        Ligor
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-white p-4 text-slate-900 shadow-lg">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-black">Värva</h2>

                      <Link
                        href="/varva"
                        className="text-xs text-slate-600 hover:underline"
                      >
                        Mer
                      </Link>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Dela din värvlänk och bjud in fler till ligan.
                    </p>

                    <Link
                      href="/varva"
                      className="mt-4 block w-full rounded-xl bg-emerald-500 py-2 text-center text-sm font-bold text-white transition hover:bg-emerald-400"
                    >
                      Öppna värvarsidan
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mt-4">
          <NewsPreview />
        </div>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              Snabblänkar
            </h2>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <Link
                href="/matcher-idag"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                <span className="text-xl">⚽</span>
                <span>Matcher idag</span>
              </Link>

              <Link
                href="/medlemmar"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                <span className="text-xl">👥</span>
                <span>Medlemmar</span>
              </Link>

              <Link
                href="/league"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                <span className="text-xl">🏆</span>
                <span>Ligor</span>
              </Link>

              <Link
                href="/lag"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                <span className="text-xl">🧠</span>
                <span>Lag & spelare</span>
              </Link>

              <Link
                href="/tv-guide"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                <span className="text-xl">📺</span>
                <span>TV-guide</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}