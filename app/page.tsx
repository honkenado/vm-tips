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

  if (!user) redirect("/login");

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
    .select("id, home_team, away_team, match_date")
    .gte("match_date", nowIso)
    .order("match_date", { ascending: true })
    .limit(3);

  const latestNewsSafe = latestNews ?? [];
  const upcomingMatchesSafe = upcomingMatches ?? [];
  const nextMatch = upcomingMatchesSafe[0];

  const participantCount = 428;
  const referralCount = 3;
  const referralCode = profile?.payment_code || "ABC12";
  const referralEarnings = getReferralEarnings(referralCount);

  const daysLeft = getDaysLeft(nextMatch?.match_date ?? null);

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.email;

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-[1400px] px-4 py-4">
        <section className="rounded-[2rem] border bg-gradient-to-br from-green-700 to-slate-900 text-white p-6">
          <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">

            {/* LEFT */}
            <div>
              <h1 className="text-4xl font-black">
                Välkommen till Addes VM-tips
              </h1>

              <p className="mt-2 text-white/80">
                Lägg dina tips och tävla mot andra.
              </p>

              <div className="mt-4 flex gap-3">
                <div className="bg-white/10 px-4 py-2 rounded-xl">
                  {participantCount} deltagare
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-xl">
                  {daysLeft ?? "-"} dagar kvar
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <Link href="/tips" className="bg-emerald-500 px-4 py-2 rounded-xl font-bold">
                  Fortsätt tippa
                </Link>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-2">

              {/* USER */}
              <div className="bg-slate-900/40 p-3 rounded-xl text-sm">
                {displayName}
              </div>

              {/* MATCH */}
              <div className="bg-white text-black p-3 rounded-xl">
                <h2 className="font-bold text-lg">Nästa match</h2>
                {nextMatch ? (
                  <div className="text-sm">
                    {nextMatch.home_team} - {nextMatch.away_team}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Inga matcher
                  </div>
                )}
              </div>

              {/* STATUS */}
              <div className="bg-white text-black p-3 rounded-xl">
                <h2 className="font-bold text-lg">Din status</h2>
                <div className="text-sm">45% klart</div>
              </div>

              {/* REFERRAL */}
              <div className="bg-white text-black p-3 rounded-xl">
                <h2 className="font-bold text-lg">Värva</h2>
                <div className="text-xl font-bold">{referralCode}</div>
                <div className="text-sm">
                  {referralCount} st · {referralEarnings} kr
                </div>
              </div>

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}