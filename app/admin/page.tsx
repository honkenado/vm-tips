import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Betalningar */}
      <Link
        href="/admin/payments"
        className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm transition hover:shadow-md"
      >
        <h2 className="mb-2 text-xl font-semibold text-slate-900">
          Betalningskoll
        </h2>
        <p className="text-sm text-slate-600">
          Se vilka som har betalat och markera betalstatus.
        </p>
      </Link>

      {/* Resultat */}
      <Link
        href="/admin/results"
        className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm transition hover:shadow-md"
      >
        <h2 className="mb-2 text-xl font-semibold text-slate-900">
          Resultat / facit
        </h2>
        <p className="text-sm text-slate-600">
          Mata in officiella resultat och slutspel.
        </p>
      </Link>
    </div>
  );
}