"use client";

export default function PredictionPrintActions() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
      >
        Skriv ut / Spara som PDF
      </button>

      <button
        type="button"
        onClick={() => window.history.back()}
        className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        Tillbaka
      </button>
    </div>
  );
}