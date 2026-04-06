"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ScoreBreakdown } from "@/lib/scoring";

type MyResultsResponse = {
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    payment_code: string | null;
    payment_status: "paid" | "unpaid" | null;
  } | null;
  hasPrediction: boolean;
  hasOfficialResults: boolean;
  officialResultsReady: boolean;
  prediction: {
    updated_at: string | null;
    golden_boot: string;
    golden_boot_corrected: string;
    chosen_golden_boot: string;
  } | null;
  breakdown: ScoreBreakdown | null;
  error?: string;
};

type ScoreRow = {
  label: string;
  value: number;
};

function PremiumCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="border-b border-white/8 bg-[linear-gradient(90deg,rgba(16,185,129,0.10),rgba(255,255,255,0.02))] px-5 py-5 sm:px-6">
        <h2 className="text-xl font-black tracking-tight text-white">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm leading-6 text-white/65">{subtitle}</p>
        ) : null}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default function MyResultsPage() {
  const [data, setData] = useState<MyResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/my-results", {
          cache: "no-store",
        });

        const json = (await res.json()) as MyResultsResponse;

        if (!res.ok) {
          setError(json.error || "Kunde inte hämta ditt resultat");
          return;
        }

        setData(json);
      } catch (err) {
        console.error(err);
        setError("Något gick fel när ditt resultat skulle hämtas");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const displayName = useMemo(() => {
    if (!data?.profile) return "Mitt resultat";

    const fullName = [data.profile.first_name, data.profile.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    return fullName || data.profile.username || "Mitt resultat";
  }, [data]);

  const rows = useMemo<ScoreRow[]>(() => {
    if (!data?.breakdown) return [];

    return [
      { label: "Rätt utfall i gruppspel", value: data.breakdown.groupMatchPoints },
      { label: "Exakta resultat-bonus", value: data.breakdown.exactScoreBonusPoints },
      { label: "Rätt tabellplaceringar", value: data.breakdown.tablePlacementPoints },
      { label: "Rätt lag i sextondelsfinal", value: data.breakdown.round32Points },
      { label: "Rätt lag i åttondelsfinal", value: data.breakdown.round16Points },
      { label: "Rätt lag i kvartsfinal", value: data.breakdown.quarterfinalPoints },
      { label: "Rätt lag i semifinal", value: data.breakdown.semifinalPoints },
      { label: "Rätt lag i final", value: data.breakdown.finalPoints },
      { label: "Rätt lag i bronsmatch", value: data.breakdown.bronzeMatchPoints },
      { label: "Rätt världsmästare", value: data.breakdown.winnerBonusPoints },
      { label: "Rätt skyttekung", value: data.breakdown.goldenBootPoints },
    ];
  }, [data]);

  return (
    <main className="min-h-screen bg-[#020617] px-3 py-4 pb-24 sm:px-4 sm:py-6 md:px-6 md:py-8 md:pb-8">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute right-[-120px] top-[140px] h-[420px] w-[420px] rounded-full bg-emerald-400/8 blur-[140px]" />
        <div className="absolute bottom-[-140px] left-[18%] h-[360px] w-[360px] rounded-full bg-emerald-300/6 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center gap-3 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
          >
            ← Till startsidan
          </Link>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-4 py-2 text-sm font-semibold text-emerald-100">
            Mina poäng
          </div>
        </div>

        <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/6 bg-[#020617] p-5 text-white shadow-[0_30px_100px_rgba(0,0,0,0.7)] sm:p-6">
          <div className="pointer-events-none absolute -left-24 top-0 h-[220px] w-[220px] rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="pointer-events-none absolute right-[-50px] top-6 h-[180px] w-[180px] rounded-full bg-emerald-400/8 blur-[90px]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.14),rgba(2,6,23,0.0)_35%,rgba(2,6,23,0.0)_65%,rgba(16,185,129,0.06))]" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/85 backdrop-blur-xl">
                Addes VM-tips
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Mitt resultat
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
                Här ser du bara dina egna poäng och din poängfördelning hittills.
              </p>
            </div>

            {data?.breakdown ? (
              <div className="w-fit rounded-[1.75rem] border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur-xl">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/65">
                  Totalpoäng
                </div>
                <div className="mt-1 text-4xl font-black leading-none text-white">
                  {data.breakdown.total}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {loading && (
          <PremiumCard
            title="Laddar..."
            subtitle="Hämtar ditt resultat."
          >
            <p className="text-sm text-white/70">Vänta en liten stund.</p>
          </PremiumCard>
        )}

        {!loading && error && (
          <PremiumCard
            title="Kunde inte hämta resultat"
            subtitle="Något gick fel."
          >
            <p className="text-sm text-red-300">{error}</p>
          </PremiumCard>
        )}

        {!loading && !error && data && !data.hasPrediction && (
          <PremiumCard
            title="Du har inget sparat tips ännu"
            subtitle="Spara ditt tips först för att kunna se dina poäng här."
          >
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tips"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500/95 px-4 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)] transition hover:bg-emerald-400"
              >
                Gå till tipset
              </Link>
            </div>
          </PremiumCard>
        )}

        {!loading && !error && data && data.hasPrediction && (
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <PremiumCard
                title="Deltagare"
                subtitle="Din profil i tävlingen."
              >
                <div className="space-y-3 text-sm text-white/80">
                  <p>
                    <span className="font-semibold text-white">Namn:</span>{" "}
                    {displayName}
                  </p>

                  {data.profile?.username && (
                    <p>
                      <span className="font-semibold text-white">Användarnamn:</span>{" "}
                      {data.profile.username}
                    </p>
                  )}

                  {data.profile?.payment_code && (
                    <p>
                      <span className="font-semibold text-white">Betalkod:</span>{" "}
                      {data.profile.payment_code}
                    </p>
                  )}

                  {data.profile?.payment_status && (
                    <p>
                      <span className="font-semibold text-white">Status:</span>{" "}
                      {data.profile.payment_status === "paid" ? "Betald" : "Ej betald"}
                    </p>
                  )}
                </div>
              </PremiumCard>

              <PremiumCard
                title="Skyttekung"
                subtitle="Ditt aktuella skyttekungstips."
              >
                <div className="space-y-3 text-sm text-white/80">
                  <p>
                    <span className="font-semibold text-white">Val:</span>{" "}
                    {data.prediction?.chosen_golden_boot || "Inget valt"}
                  </p>

                  {data.breakdown && (
                    <p>
                      <span className="font-semibold text-white">Poäng:</span>{" "}
                      {data.breakdown.goldenBootPoints}
                    </p>
                  )}
                </div>
              </PremiumCard>

              <PremiumCard
                title="Senaste sparning"
                subtitle="När ditt tips senast uppdaterades."
              >
                <div className="space-y-3 text-sm text-white/80">
                  <p>
                    {data.prediction?.updated_at
                      ? new Date(data.prediction.updated_at).toLocaleString("sv-SE")
                      : "Okänt"}
                  </p>

                  <p className="text-white/55">
                    Resultatet räknas ut mot officiella resultat som lagts in i admin.
                  </p>
                </div>
              </PremiumCard>
            </div>

            {!data.hasOfficialResults && (
              <PremiumCard
                title="Inga officiella resultat ännu"
                subtitle="Poäng visas så fort resultat har lagts in i admin."
              >
                <p className="text-sm text-white/70">
                  Ditt tips är sparat, men det finns ännu inget officiellt underlag att räkna mot.
                </p>
              </PremiumCard>
            )}

            {data.breakdown && (
              <PremiumCard
                title="Poängfördelning"
                subtitle="Så här har dina poäng fördelats hittills."
              >
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {rows.map((row) => (
                    <div
                      key={row.label}
                      className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl"
                    >
                      <div className="text-sm font-semibold leading-6 text-white/65">
                        {row.label}
                      </div>
                      <div className="mt-2 text-3xl font-black text-white">
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            )}

            {data.breakdown && (
              <PremiumCard
                title="Sammanfattning"
                subtitle="En enkel översikt över ditt läge i tävlingen."
              >
                <div className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm leading-7 text-emerald-50">
                  Du har just nu <span className="font-black">{data.breakdown.total} poäng</span>.
                  Här visas bara dina egna poängkategorier — inte andra deltagares framtida tips.
                </div>
              </PremiumCard>
            )}
          </div>
        )}
      </div>
    </main>
  );
}