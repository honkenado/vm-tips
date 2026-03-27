"use client";

export default function GoldenBootSection({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:p-5 md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-black text-slate-900 sm:text-xl md:text-2xl">
          Skyttekung
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Tippa vilken spelare som vinner skytteligan. Rätt skyttekung ger 7
          poäng.
        </p>
      </div>

      <div className="max-w-xl">
        <label
          htmlFor="golden-boot"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Din skyttekung
        </label>

        <input
          id="golden-boot"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Skriv spelarens namn..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
        />

        <p className="mt-2 text-xs text-slate-500">
          Exempel: Kylian Mbappé
        </p>
      </div>
    </div>
  );
}