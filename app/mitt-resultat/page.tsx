"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SectionCard from "@/components/SectionCard";
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_35%,_#f1f5f9_68%,_#e2e8f0_100%)] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center gap-3 sm:mb-6">
          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Till startsidan
          </Link>

          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            Mina poäng
          </div>
        </div>

        <section className="mb-6 overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-gradient-to-r from-emerald-950 via-green-900 to-slate-950 p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.20)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-100">
                Addes VM-tips
              </div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Mitt resultat
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                Här ser du bara dina egna poäng och din poängfördelning hittills.
              </p>
            </div>

            {data?.breakdown && (
              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-200">
                  Totalpoäng
                </div>
                <div className="mt-1 text-4xl font-black leading-none">
                  {data.breakdown.total}
                </div>
              </div>
            )}
          </div>
        </section>

        {loading && (
          <SectionCard title="Laddar..." subtitle="Hämtar ditt resultat.">
            <p className="text-sm text-slate-600">Vänta en liten stund.</p>
          </SectionCard>
        )}

        {!loading && error && (
          <SectionCard title="Kunde inte hämta resultat" subtitle="Något gick fel.">
            <p className="text-sm text-red-600">{error}</p>
          </SectionCard>
        )}

        {!loading && !error && data && !data.hasPrediction && (
          <SectionCard
            title="Du har inget sparat tips ännu"
            subtitle="Spara ditt tips först för att kunna se dina poäng här."
          >
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Gå till mitt tips
              </Link>
            </div>
          </SectionCard>
        )}

        {!loading && !error && data && data.hasPrediction && (
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <SectionCard title="Deltagare" subtitle="Din profil i tävlingen.">
                <div className="space-y-2 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-900">Namn:</span>{" "}
                    {displayName}
                  </p>

                  {data.profile?.username && (
                    <p>
                      <span className="font-semibold text-slate-900">Användarnamn:</span>{" "}
                      {data.profile.username}
                    </p>
                  )}

                  {data.profile?.payment_code && (
                    <p>
                      <span className="font-semibold text-slate-900">Betalkod:</span>{" "}
                      {data.profile.payment_code}
                    </p>
                  )}

                  {data.profile?.payment_status && (
                    <p>
                      <span className="font-semibold text-slate-900">Status:</span>{" "}
                      {data.profile.payment_status === "paid" ? "Betald" : "Ej betald"}
                    </p>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Skyttekung" subtitle="Ditt aktuella skyttekungstips.">
                <div className="space-y-2 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-900">Val:</span>{" "}
                    {data.prediction?.chosen_golden_boot || "Inget valt"}
                  </p>

                  {data.breakdown && (
                    <p>
                      <span className="font-semibold text-slate-900">Poäng:</span>{" "}
                      {data.breakdown.goldenBootPoints}
                    </p>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Senaste sparning" subtitle="När ditt tips senast uppdaterades.">
                <div className="space-y-2 text-sm text-slate-700">
                  <p>
                    {data.prediction?.updated_at
                      ? new Date(data.prediction.updated_at).toLocaleString("sv-SE")
                      : "Okänt"}
                  </p>

                  <p className="text-slate-500">
                    Resultatet räknas ut mot officiella resultat som lagts in i admin.
                  </p>
                </div>
              </SectionCard>
            </div>

            {!data.hasOfficialResults && (
              <SectionCard
                title="Inga officiella resultat ännu"
                subtitle="Poäng visas så fort resultat har lagts in i admin."
              >
                <p className="text-sm text-slate-600">
                  Ditt tips är sparat, men det finns ännu inget officiellt underlag att räkna mot.
                </p>
              </SectionCard>
            )}

            {data.breakdown && (
              <SectionCard
                title="Poängfördelning"
                subtitle="Så här har dina poäng fördelats hittills."
              >
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {rows.map((row) => (
                    <div
                      key={row.label}
                      className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                    >
                      <div className="text-sm font-semibold text-slate-600">
                        {row.label}
                      </div>
                      <div className="mt-2 text-3xl font-black text-slate-900">
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {data.breakdown && (
              <SectionCard
                title="Sammanfattning"
                subtitle="En enkel översikt över ditt läge i tävlingen."
              >
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  Du har just nu <span className="font-black">{data.breakdown.total} poäng</span>.
                  Här visas bara dina egna poängkategorier — inte andra deltagares framtida tips.
                </div>
              </SectionCard>
            )}
          </div>
        )}
      </div>
    </main>
  );
}