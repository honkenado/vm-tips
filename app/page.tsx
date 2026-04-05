import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type NewsItem = {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  published_at: string | null;
  slug: string | null;
};

type MatchItem = {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  group_name?: string | null;
  tv_channel?: string | null;
  tv_stream?: string | null;
};

type PredictionResponse = {
  prediction?: {
    group_stage?: Array<{
      name: string;
      matches: Array<{
        id: number;
        homeGoals: string;
        awayGoals: string;
      }>;
    }>;
    knockout?: Record<string, string>;
    golden_boot?: string | null;
  } | null;
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

function getDaysLeft(targetDate: string | null) {
  if (!targetDate) return null;
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getReferralEarnings(referralCount: number) {
  return Math.min(referralCount * 20, 500);
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

  let prediction: PredictionResponse["prediction"] = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name, email, payment_code, payment_status, is_admin")
      .eq("id", user.id)
      .single();

    profile = data;

    const cookieHeader = (await supabase.auth.getSession()).data.session?.access_token;

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";

      const res = await fetch(`${baseUrl}/api/prediction`, {
        headers: cookieHeader
          ? {
              Authorization: `Bearer ${cookieHeader}`,
            }
          : undefined,
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json()) as PredictionResponse;
        prediction = data.prediction ?? null;
      }
    } catch (error) {
      console.error("Kunde inte läsa prediction på startsidan", error);
    }
  }

  const nowIso = new Date().toISOString();

  const { data: upcomingMatches } = await supabase
    .from("matches")
    .select("id, home_team, away_team, match_date, group_name, tv_channel, tv_stream")
    .gte("match_date", nowIso)
    .order("match_date", { ascending: true })
    .limit(1);

  const { data: latestNews } = await supabase
    .from("news_posts")
    .select("id, title, excerpt, image_url, published_at, slug")
    .order("published_at", { ascending: false })
    .limit(2);

  const { count: participantCountRaw } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const nextMatch = ((upcomingMatches ?? [])[0] ?? null) as MatchItem | null;
  const latestNewsSafe = (latestNews ?? []) as NewsItem[];

  const participantCount = participantCountRaw ?? 0;

  const referralCount = 3;
  const referralCode = profile?.payment_code || "ABC12";
  const referralEarnings = getReferralEarnings(referralCount);
  const daysLeft = getDaysLeft(nextMatch?.match_date ?? null);

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    profile?.email ||
    "Deltagare";

  const isLoggedIn = !!user;
  const isPaid = profile?.payment_status === "paid";

  const groupProgress = countGroupProgress(prediction?.group_stage);
  const knockoutProgress = countKnockoutProgress(prediction?.knockout);
  const goldenBootDone = prediction?.golden_boot?.trim() ? 1 : 0;

  const totalProgressItems =
    groupProgress.total + knockoutProgress.total + 1;

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
                      <div className="text-2xl font-extrabold">{participantCount}</div>
                      <div className="text-sm text-white/80">deltagare</div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-sm">
                      <div className="text-2xl font-extrabold">{daysLeft ?? "-"}</div>
                      <div className="text-sm text-white/80">dagar kvar</div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-sm">
                      <div className="text-2xl font-extrabold">
                        {nextMatch ? formatShortDate(nextMatch.match_date) : "-"}
                      </div>
                      <div className="text-sm text-white/80">nästa match</div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {isLoggedIn ? (
                      <Link
                        href="/tips"
                        className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-base font-bold text-white transition hover:bg-emerald-400"
                      >
                        Gå till tipset
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-base font-bold text-white transition hover:bg-emerald-400"
                      >
                        Logga in
                      </Link>
                    )}

                    <Link
                      href="/tv-guide"
                      className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-bold text-slate-900 transition hover:bg-slate-100"
                    >
                      TV-guide
                    </Link>

                    <Link
                      href="/regler"
                      className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-base font-bold text-white transition hover:bg-white/15"
                    >
                      Se regler
                    </Link>

                    {isLoggedIn ? (
                      <Link
                        href="/varva-medlemmar"
                        className="inline-flex items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-500/20 px-6 py-3 text-base font-bold text-emerald-100 transition hover:bg-emerald-500/30"
                      >
                        Värva vänner
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                  Navigation
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    { href: "/regler", label: "Regler" },
                    { href: "/hjälp", label: "Hjälp" },
                    { href: "/medlemmar", label: "Medlemmar" },
                    { href: "/tv-guide", label: "TV-guide" },
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
                        href="/varva-medlemmar"
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
                    href="/matcher"
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
                  href="/matcher"
                  className="mt-3 block w-full rounded-xl bg-slate-900 py-2 text-center text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Matchschema
                </Link>
              </div>

              {isLoggedIn ? (
                <>
                  <div className="rounded-[1.5rem] bg-white p-4 text-slate-900 shadow-lg">
                    <h2 className="text-lg font-black">Din status</h2>

                    <div className="mt-2 text-xs text-slate-500">
                      {statusText}
                    </div>

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
                        href="/leaderboard"
                        className="rounded-xl bg-slate-900 py-2 text-center text-sm font-bold text-white transition hover:bg-slate-800"
                      >
                        Leaderboard
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-white p-4 text-slate-900 shadow-lg">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-black">Värva</h2>

                      <Link
                        href="/varva-medlemmar"
                        className="text-xs text-slate-600 hover:underline"
                      >
                        Mer
                      </Link>
                    </div>

                    <div className="mt-2 rounded-xl border bg-slate-50 p-3 text-center text-lg font-black">
                      {referralCode}
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-xl border p-2 text-center">
                        {referralCount} st
                      </div>
                      <div className="rounded-xl border p-2 text-center">
                        {referralEarnings} kr
                      </div>
                    </div>

                    <Link
                      href="/varva-medlemmar"
                      className="mt-3 block w-full rounded-xl bg-emerald-500 py-2 text-center text-sm font-bold text-white transition hover:bg-emerald-400"
                    >
                      Dela länk
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.85),_rgba(2,6,23,1)_70%)] px-5 py-4 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                  Kommunikation
                </p>
                <h2 className="text-3xl font-black tracking-tight">Senaste nytt</h2>
              </div>

              <Link
                href="/nyheter"
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Alla nyheter
              </Link>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              {latestNewsSafe.length > 0 ? (
                latestNewsSafe.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="aspect-[16/10] bg-slate-200">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          Ingen bild
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="line-clamp-2 text-xl font-black leading-tight text-slate-900">
                        {item.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                        {item.excerpt || "Läs mer om den senaste uppdateringen."}
                      </p>

                      <Link
                        href={item.slug ? `/nyheter/${item.slug}` : "/nyheter"}
                        className="mt-3 inline-flex text-sm font-bold text-emerald-700 transition hover:text-emerald-600"
                      >
                        Läs mer →
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  Inga nyheter publicerade ännu.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              Quick links
            </h2>

            <div className="mt-4 grid gap-3">
              <Link
                href="/matcher"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                <span className="text-xl">⚽</span>
                <span>Matcher</span>
              </Link>

              <Link
                href="/leaderboard"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                <span className="text-xl">🏆</span>
                <span>Leaderboard</span>
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