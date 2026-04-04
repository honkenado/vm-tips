import Link from "next/link";
import { redirect } from "next/navigation";
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
  group_name: string | null;
  tv_channel: string | null;
  tv_stream: string | null;
};

function formatDate(dateString: string | null) {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

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

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, payment_code, payment_status, is_admin")
    .eq("id", user.id)
    .single();

  const { data: latestNews } = await supabase
    .from("news_posts")
    .select("id, title, excerpt, image_url, published_at, slug")
    .order("published_at", { ascending: false })
    .limit(3);

  const nowIso = new Date().toISOString();

  const { data: upcomingMatches } = await supabase
    .from("matches")
    .select("id, home_team, away_team, match_date, group_name, tv_channel, tv_stream")
    .gte("match_date", nowIso)
    .order("match_date", { ascending: true })
    .limit(3);

  const latestNewsSafe = (latestNews ?? []) as NewsItem[];
  const upcomingMatchesSafe = (upcomingMatches ?? []) as MatchItem[];

  const nextMatch = upcomingMatchesSafe[0];

  const participantCount = 428;
  const referralCount = 3;
  const referralCode = profile?.payment_code || "ABC12";
  const referralEarnings = getReferralEarnings(referralCount);

  const tournamentStartDate = nextMatch?.match_date ?? null;
  const daysLeft = getDaysLeft(tournamentStartDate);

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.email ||
    "Deltagare";

  const paymentStatus =
    profile?.payment_status === "paid" ? "Betald" : "Ej betald";

  const paymentStatusClasses =
    profile?.payment_status === "paid"
      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
      : "border-amber-400/40 bg-amber-500/15 text-amber-100";

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-4 px-4 py-4 md:px-6 md:py-4">
        <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.55),_rgba(3,7,18,1)_75%)] text-white shadow-xl lg:min-h-[calc(100vh-2rem)]">
          <div className="grid gap-4 p-4 md:grid-cols-[1.35fr_0.85fr] md:p-6 lg:h-full">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between md:justify-start">
                <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
                  FIFA World Cup 2026
                </span>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="shrink-0">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-lg md:h-28 md:w-28">
                    <img
                      src="/logo.png"
                      alt="Addes VM-tips"
                      className="h-20 w-20 object-contain md:h-24 md:w-24"
                    />
                  </div>
                </div>

                <div className="max-w-3xl">
                  <h1 className="text-3xl font-black leading-tight tracking-tight md:text-6xl">
                    Välkommen till Addes VM-tips
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm text-white/85 md:text-xl">
                    Lägg dina tips, följ spänningen i fotbolls-VM och tävla mot
                    andra om ära, poäng och en topplacering i tabellen.
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
                    <Link
                      href="/tips"
                      className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-base font-bold text-white transition hover:bg-emerald-400"
                    >
                      Fortsätt tippa
                    </Link>

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

                    <Link
                      href="/varva-medlemmar"
                      className="inline-flex items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-500/20 px-6 py-3 text-base font-bold text-emerald-100 transition hover:bg-emerald-500/30"
                    >
                      Värva vänner
                    </Link>
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
                    { href: "/mitt-resultat", label: "Mitt resultat" },
                    { href: "/tv-guide", label: "TV-guide" },
                    { href: "/lag", label: "Lag & spelare" },
                    { href: "/varva-medlemmar", label: "Värva medlemmar" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/15"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-start gap-3 rounded-[1.75rem] border border-white/10 bg-slate-950/30 p-4 shadow-lg md:items-end">
                <div className="text-sm text-white/80">{displayName}</div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-bold text-white">
                    {profile?.payment_code || "Ingen kod"}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${paymentStatusClasses}`}
                  >
                    {paymentStatus}
                  </span>
                </div>

                <div className="w-full rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
                  Swisha 170 kr till 070-3222546 och märk med kod{" "}
                  <span className="font-extrabold">
                    {profile?.payment_code || "Ingen kod"}
                  </span>
                  .
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile?.is_admin ? (
                    <Link
                      href="/admin"
                      className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-400"
                    >
                      Admin
                    </Link>
                  ) : null}

                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
                    >
                      Logga ut
                    </button>
                  </form>
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-white p-4 text-slate-900 shadow-lg">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-3xl font-black tracking-tight">Nästa match</p>
                    {nextMatch ? (
                      <p className="text-sm text-slate-500">
                        {nextMatch.group_name || "Gruppspel"} ·{" "}
                        {formatShortDate(nextMatch.match_date)} ·{" "}
                        {formatTime(nextMatch.match_date)}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500">Ingen match hittad</p>
                    )}
                  </div>

                  <Link
                    href="/matcher"
                    className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Se allt
                  </Link>
                </div>

                {nextMatch ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-2xl font-black">
                          {nextMatch.home_team} - {nextMatch.away_team}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {nextMatch.group_name || "Gruppspel"} ·{" "}
                          {formatShortDate(nextMatch.match_date)}
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          TV: {nextMatch.tv_channel || "TBA"}
                          {nextMatch.tv_stream
                            ? ` · Stream: ${nextMatch.tv_stream}`
                            : ""}
                        </div>
                      </div>

                      <div className="rounded-full bg-slate-900 px-3 py-1 text-sm font-bold text-white">
                        {formatTime(nextMatch.match_date)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Det finns inga kommande matcher just nu.
                  </div>
                )}

                <Link
                  href="/matcher"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-base font-bold text-white transition hover:bg-slate-800"
                >
                  Öppna nästa matchdag
                </Link>
              </div>

              <div className="rounded-[1.75rem] bg-white p-4 text-slate-900 shadow-lg">
                <h2 className="text-2xl font-black tracking-tight">Din status</h2>
                <div className="mt-3 text-sm text-slate-500">
                  Du har sparat ditt tips men inte skickat in allt ännu.
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[45%] rounded-full bg-emerald-500" />
                </div>

                <div className="mt-2 text-sm font-semibold text-slate-700">
                  45% klart
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <Link
                    href="/tips"
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-base font-bold text-white transition hover:bg-emerald-400"
                  >
                    Fortsätt tippa
                  </Link>

                  <Link
                    href="/leaderboard"
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-base font-bold text-white transition hover:bg-slate-800"
                  >
                    Se leaderboard
                  </Link>

                  <Link
                    href="/tv-guide"
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-base font-bold text-white transition hover:bg-slate-800"
                  >
                    Öppna TV-guide
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-white p-4 text-slate-900 shadow-lg">
  <div className="flex items-start justify-between gap-3">
    <div>
      <h2 className="text-2xl font-black tracking-tight">
        Värva vänner
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Tjäna 20 kr per betalande värvning. Max 500 kr.
      </p>
    </div>

    <Link
      href="/varva-medlemmar"
      className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      Se mer
    </Link>
  </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Din kod
                  </div>
                  <div className="mt-1 text-2xl font-black">{referralCode}</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-sm text-slate-500">Värvningar</div>
                    <div className="mt-1 text-2xl font-black">{referralCount}</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-sm text-slate-500">Intjänat</div>
                    <div className="mt-1 text-2xl font-black">{referralEarnings} kr</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>Progress</span>
                    <span>{referralEarnings} / 500 kr</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${(referralEarnings / 500) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Endast topp 1–2 i värvarligan får ersättning.
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <Link
                    href="/varva-medlemmar"
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-base font-bold text-white transition hover:bg-emerald-400"
                  >
                    Dela värvningslänk
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.9fr_1fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.85),_rgba(2,6,23,1)_70%)] px-5 py-4 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                  Kommunikation
                </p>
                <h2 className="text-4xl font-black tracking-tight">Senaste nytt</h2>
              </div>

              <Link
                href="/nyheter"
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Alla nyheter
              </Link>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
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
                      <p className="text-xs font-medium text-slate-400">
                        {formatDate(item.published_at)}
                      </p>

                      <h3 className="mt-2 line-clamp-2 text-2xl font-black leading-tight text-slate-900">
                        {item.title}
                      </h3>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {item.excerpt || "Läs mer om den senaste uppdateringen."}
                      </p>

                      <Link
                        href={item.slug ? `/nyheter/${item.slug}` : "/nyheter"}
                        className="mt-4 inline-flex text-sm font-bold text-emerald-700 transition hover:text-emerald-600"
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                  Nästa matcher
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Håll koll på kommande matcher och sändningar.
                </p>
              </div>

              <Link
                href="/matcher"
                className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Se allt
              </Link>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {upcomingMatchesSafe.length > 0 ? (
                upcomingMatchesSafe.map((match) => (
                  <div
                    key={match.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-black text-slate-900">
                          {match.home_team} - {match.away_team}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {match.group_name || "Gruppspel"} ·{" "}
                          {formatShortDate(match.match_date)}
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          TV: {match.tv_channel || "TBA"}
                          {match.tv_stream ? ` · Stream: ${match.tv_stream}` : ""}
                        </div>
                      </div>

                      <div className="rounded-full bg-slate-900 px-3 py-1 text-sm font-bold text-white">
                        {formatTime(match.match_date)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  Inga kommande matcher hittades.
                </div>
              )}
            </div>

            <Link
              href="/matcher"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-base font-bold text-white transition hover:bg-slate-800"
            >
              Öppna hela matchdagen
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Quick links
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { href: "/matcher", label: "Matcher", icon: "⚽" },
              { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
              { href: "/lag", label: "Lag & spelare", icon: "🧠" },
              { href: "/tv-guide", label: "TV-guide", icon: "📺" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}