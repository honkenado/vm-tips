import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth-admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdmin();

  const displayName =
    [admin.first_name, admin.last_name].filter(Boolean).join(" ") ||
    admin.username ||
    admin.email ||
    "Admin";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Adminpanel</h1>
            <p className="text-sm text-slate-600">
              Inloggad som <span className="font-medium">{displayName}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Betalningskoll
            </Link>
            <Link
              href="/admin/results"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Resultat / facit
            </Link>
            <Link
              href="/"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Till startsidan
            </Link>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}