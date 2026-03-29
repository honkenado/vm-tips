"use client";

import { useEffect, useState } from "react";
import PredictionPrintActions from "@/components/PredictionPrintActions";
import PredictionPrintDocument from "@/components/PredictionPrintDocument";

type RawMatch = {
  id?: string | number;
  homeTeam?: string;
  awayTeam?: string;
  homeGoals?: string | number | null;
  awayGoals?: string | number | null;
  homeScore?: string | number | null;
  awayScore?: string | number | null;
};

type RawGroup = {
  name?: string;
  groupName?: string;
  teams?: string[];
  matches?: RawMatch[];
};

type StoredPrediction = {
  groups: RawGroup[];
  knockout: Record<string, string>;
  goldenBoot: string | null;
  savedAt?: string;
};

type ApiPredictionResponse = {
  prediction?: {
    group_stage?: RawGroup[];
    knockout?: Record<string, string>;
    golden_boot?: string | null;
    golden_boot_corrected?: string | null;
    updated_at?: string | null;
  };
  error?: string;
};

export default function PredictionPdfPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<RawGroup[]>([]);
  const [knockout, setKnockout] = useState<Record<string, string>>({});
  const [goldenBoot, setGoldenBoot] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrediction() {
      try {
        setLoading(true);
        setError(null);

        if (typeof window !== "undefined") {
          const raw = sessionStorage.getItem("prediction_pdf");

          if (raw) {
            const stored = JSON.parse(raw) as StoredPrediction;

            setGroups(Array.isArray(stored.groups) ? stored.groups : []);
            setKnockout(
              stored.knockout && typeof stored.knockout === "object"
                ? stored.knockout
                : {}
            );
            setGoldenBoot(stored.goldenBoot ?? null);
            setUpdatedAt(stored.savedAt ?? new Date().toISOString());
            setLoading(false);
            return;
          }
        }

        const res = await fetch("/api/prediction", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await res.json()) as ApiPredictionResponse;

        if (!res.ok) {
          setError(data.error || "Kunde inte läsa prediction");
          setLoading(false);
          return;
        }

        const prediction = data.prediction;

        if (!prediction) {
          setGroups([]);
          setKnockout({});
          setGoldenBoot(null);
          setUpdatedAt(null);
          setLoading(false);
          return;
        }

        setGroups(Array.isArray(prediction.group_stage) ? prediction.group_stage : []);
        setKnockout(
          prediction.knockout && typeof prediction.knockout === "object"
            ? prediction.knockout
            : {}
        );
        setGoldenBoot(prediction.golden_boot_corrected || prediction.golden_boot || null);
        setUpdatedAt(prediction.updated_at || null);
      } catch (err) {
        console.error("Kunde inte läsa prediction till PDF", err);
        setError("Något gick fel när PDF-sidan skulle laddas");
      } finally {
        setLoading(false);
      }
    }

    loadPrediction();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-3 py-4 print:bg-white print:px-0 print:py-0">
        <div className="mx-auto max-w-[1200px]">
          <PredictionPrintActions />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
            <p className="text-sm text-slate-600">Laddar PDF-underlag...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 px-3 py-4 print:bg-white print:px-0 print:py-0">
        <div className="mx-auto max-w-[1200px]">
          <PredictionPrintActions />
          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
            <h1 className="text-xl font-bold text-slate-900">Kunde inte öppna PDF-vyn</h1>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!groups.length) {
    return (
      <main className="min-h-screen bg-slate-100 px-3 py-4 print:bg-white print:px-0 print:py-0">
        <div className="mx-auto max-w-[1200px]">
          <PredictionPrintActions />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
            <h1 className="text-xl font-bold text-slate-900">Inget sparat tips hittades</h1>
            <p className="mt-2 text-sm text-slate-600">
              Gå tillbaka, fyll i ditt tips och klicka på <strong>Spara & PDF</strong>.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-[1200px]">
        <PredictionPrintActions />

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <PredictionPrintDocument
            profileName="Ditt tips"
            updatedAt={updatedAt}
            goldenBoot={goldenBoot}
            groups={groups}
            knockout={knockout}
          />
        </div>
      </div>
    </main>
  );
}