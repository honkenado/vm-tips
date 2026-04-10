"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileData = {
  id: string;
  referral_code: string | null;
};

type ReferralLeaderboardRow = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  referral_code: string | null;
  paid_referrals: number;
};

type ReferralDetailRow = {
  referrer_id: string;
  referred_user_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  payment_status?: string | null;
};

function buildShareTexts(link: string) {
  const shortText = `Häng med i Addes VM-tips 2026 ⚽
Registrera dig här:
${link}`;

  const longText = `Häng med i Addes VM-tips 2026 ⚽

Tippa hela VM direkt i appen, följ ditt resultat live och tävla i huvudligan och kompisligor.

Registrera dig här:
${link}`;

  return { shortText, longText };
}

function getDisplayName(row: {
  username: string | null;
  first_name: string | null;
  last_name: string | null;
}) {
  const fullName = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim();
  if (fullName) return fullName;
  if (row.username) return row.username;
  return "Okänd användare";
}

function getPayoutForRow(rank: number, paidReferrals: number) {
  if (rank !== 1 && rank !== 2) return 0;
  return Math.min(paidReferrals * 20, 500);
}

export default function ReferralPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboardRow[]>([]);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [referralsMap, setReferralsMap] = useState<
    Record<string, ReferralDetailRow[]>
  >({});

  useEffect(() => {
    async function loadReferralData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setNotLoggedIn(true);
          setLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, referral_code")
          .eq("id", user.id)
          .single();

        if (profileError || !profileData) {
          setLoading(false);
          return;
        }

        setProfile(profileData);

        const { data: leaderboardData, error: leaderboardError } = await supabase
          .from("referral_leaderboard")
          .select("id, username, first_name, last_name, referral_code, paid_referrals")
          .order("paid_referrals", { ascending: false });

        if (!leaderboardError && leaderboardData) {
          setLeaderboard(leaderboardData);
        }

        const { data: referralsData, error: referralsError } = await supabase
          .from("referral_details")
          .select(
            "referrer_id, referred_user_id, username, first_name, last_name, payment_status"
          );

        if (!referralsError && referralsData) {
          const map: Record<string, ReferralDetailRow[]> = {};

          referralsData.forEach((item) => {
            if (!map[item.referrer_id]) {
              map[item.referrer_id] = [];
            }
            map[item.referrer_id].push(item);
          });

          Object.keys(map).forEach((key) => {
            map[key].sort((a, b) =>
              getDisplayName(a).localeCompare(getDisplayName(b), "sv")
            );
          });

          setReferralsMap(map);
        }
      } finally {
        setLoading(false);
      }
    }

    loadReferralData();
  }, [supabase]);

  useEffect(() => {
    if (!copyMessage) return;

    const timeout = window.setTimeout(() => {
      setCopyMessage(null);
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [copyMessage]);

  const referralLink = useMemo(() => {
    if (!profile?.referral_code) return "";
    return `https://addesvmtips.se/register?ref=${profile.referral_code}`;
  }, [profile?.referral_code]);

  const { shortText, longText } = buildShareTexts(referralLink);

  const sortedLeaderboard = useMemo(() => {
    return [...leaderboard].sort((a, b) => {
      if (b.paid_referrals !== a.paid_referrals) {
        return b.paid_referrals - a.paid_referrals;
      }
      return getDisplayName(a).localeCompare(getDisplayName(b), "sv");
    });
  }, [leaderboard]);

  const myEntry = useMemo(() => {
    if (!profile?.id) return null;
    return sortedLeaderboard.find((row) => row.id === profile.id) ?? null;
  }, [profile?.id, sortedLeaderboard]);

  const myRank = useMemo(() => {
    if (!profile?.id) return null;
    const index = sortedLeaderboard.findIndex((row) => row.id === profile.id);
    return index >= 0 ? index + 1 : null;
  }, [profile?.id, sortedLeaderboard]);

  const myPaidReferrals = myEntry?.paid_referrals ?? 0;
  const myPayout = myRank ? getPayoutForRow(myRank, myPaidReferrals) : 0;

  async function copyText(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(message);
    } catch {
      setCopyMessage("Kunde inte kopiera.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_35%,_#f1f5f9_68%,_#e2e8f0_100%)] px-4 py-8 md:px-6">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-600">Laddar värvningssidan...</p>
        </div>
      </main>
    );
  }

  if (notLoggedIn) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_35%,_#f1f5f9_68%,_#e2e8f0_100%)] px-4 py-8 md:px-6">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">Värva medlemmar</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700 md:text-base">
            Du behöver vara inloggad för att få din personliga värvningslänk.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-slate-800"
            >
              Logga in
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-800 transition hover:bg-slate-50"
            >
              Skapa konto
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_35%,_#f1f5f9_68%,_#e2e8f0_100%)] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-gradient-to-r from-emerald-950 via-green-900 to-slate-950 p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.20)] md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">
            Addes VM-tips
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
            Värva medlemmar
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
            Dela din personliga länk och tävla om ersättning i värvarligan.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
            >
              Till startsidan
            </Link>
            <Link
              href="/rules"
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Regler
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Din status
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Din kod
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {profile?.referral_code ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Betalande värvningar
                </p>
                <p className="mt-2 text-2xl font-black text-emerald-900">
                  {myPaidReferrals}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                  Din placering
                </p>
                <p className="mt-2 text-2xl font-black text-amber-900">
                  {myRank ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                  Möjlig ersättning
                </p>
                <p className="mt-2 text-2xl font-black text-sky-900">
                  {myPayout} kr
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Din värvningslänk
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Dela länken nedan. När någon registrerar sig via din länk och sedan blir betalande räknas värvningen på dig.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="break-all text-sm font-semibold text-slate-800">
                {referralLink || "Ingen värvningslänk tillgänglig ännu."}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => copyText(referralLink, "Länken är kopierad.")}
                disabled={!referralLink}
                className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                Kopiera länk
              </button>
            </div>

            {copyMessage && (
              <p className="mt-3 text-sm text-emerald-700">{copyMessage}</p>
            )}
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Färdig text att dela
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Kopiera färdig text och skicka via sms, mail, Messenger eller sociala medier.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-900">Kort SMS-text</p>
                <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {shortText}
                </pre>

                <button
                  type="button"
                  onClick={() => copyText(shortText, "SMS-texten är kopierad.")}
                  disabled={!referralLink}
                  className="mt-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Kopiera SMS-text
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-900">Längre text</p>
                <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {longText}
                </pre>

                <button
                  type="button"
                  onClick={() =>
                    copyText(longText, "Den längre texten är kopierad.")
                  }
                  disabled={!referralLink}
                  className="mt-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Kopiera längre text
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Värvarligan
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Klicka på ett namn för att se vilka personer som har värvats.
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[56px_minmax(0,1fr)_110px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                <div>Plats</div>
                <div>Namn</div>
                <div className="text-center">Pris</div>
              </div>

              {sortedLeaderboard.length === 0 ? (
                <div className="px-4 py-4 text-sm text-slate-600">
                  Ingen värvarliga att visa ännu.
                </div>
              ) : (
                sortedLeaderboard.slice(0, 10).map((row, index) => {
                  const rank = index + 1;
                  const payout = getPayoutForRow(rank, row.paid_referrals);
                  const referredPeople = referralsMap[row.id] ?? [];
                  const isOpen = openRow === row.id;

                  return (
                    <div key={row.id} className="border-b border-slate-100 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setOpenRow(isOpen ? null : row.id)}
                        className={`grid w-full grid-cols-[56px_minmax(0,1fr)_110px] items-center gap-3 px-4 py-3 text-left text-sm transition ${
                          profile?.id === row.id
                            ? "bg-emerald-50 hover:bg-emerald-100/60"
                            : "bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="font-black text-slate-900">{rank}</div>

                        <div className="min-w-0">
  <div className="flex items-center gap-2">
    <span className="font-semibold text-slate-800">
      {getDisplayName(row)}
    </span>
    <span className="shrink-0 text-xs text-slate-400">
      {isOpen ? "▲" : "▼"}
    </span>
  </div>
</div>

                        <div className="text-center font-bold text-emerald-700">
                          {payout} kr
                        </div>
                      </button>

                      {isOpen && (
                        <div className="bg-slate-50 px-4 py-3">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                            Värvade personer
                          </p>

                          {referredPeople.length > 0 ? (
                            <ul className="space-y-2">
                              {referredPeople.map((person) => (
                                <li
                                  key={person.referred_user_id}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                                >
                                  {getDisplayName(person)}
                                  {person.payment_status === "paid" && (
                                    <span className="ml-2 font-semibold text-emerald-700">
                                      (betald)
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-slate-600">
                              Inga värvningar ännu.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Så fungerar det
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700 md:text-base">
              <li>• Endast betalande deltagare räknas för utbetalningen.</li>
              <li>• Topp 1 och topp 2 får 20 kr per betalande värvning.</li>
              <li>• Max ersättning är 500 kr per person.</li>
              <li>• Samma person kan bara räknas en gång.</li>
              <li>• Dubbelkonton och missbruk diskvalificeras.</li>
              <li>• Admin har sista ordet vid oklarheter.</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}