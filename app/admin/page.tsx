"use client";

import { useEffect, useState } from "react";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  payment_code: string | null;
  payment_status: "paid" | "unpaid";
  is_admin: boolean;
};

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadProfiles() {
    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch("/api/admin/payments");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte läsa användare");
        return;
      }

      setProfiles(data.profiles ?? []);
    } catch (error) {
      console.error(error);
      setMessage("Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  async function updatePaymentStatus(
    profileId: string,
    paymentStatus: "paid" | "unpaid"
  ) {
    try {
      setMessage(null);

      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId,
          paymentStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte uppdatera status");
        return;
      }

      setProfiles((prev) =>
        prev.map((profile) =>
          profile.id === profileId
            ? { ...profile, payment_status: paymentStatus }
            : profile
        )
      );

      setMessage("Betalstatus uppdaterad");
    } catch (error) {
      console.error(error);
      setMessage("Något gick fel");
    }
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900">Admin – betalstatus</h1>
          <p className="mt-2 text-slate-600">
            Markera vilka deltagare som har betalat.
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-100 text-sm text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-bold">Namn</th>
                  <th className="px-4 py-3 font-bold">E-post</th>
                  <th className="px-4 py-3 font-bold">Kod</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Admin</th>
                  <th className="px-4 py-3 font-bold">Åtgärd</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-sm text-slate-500">
                      Laddar användare...
                    </td>
                  </tr>
                ) : profiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-sm text-slate-500">
                      Inga användare hittades.
                    </td>
                  </tr>
                ) : (
                  profiles.map((profile) => (
                    <tr key={profile.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {profile.first_name || profile.last_name
                          ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
                          : "Saknar namn"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {profile.email || "-"}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                        {profile.payment_code || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            profile.payment_status === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {profile.payment_status === "paid" ? "Betald" : "Ej betald"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {profile.is_admin ? "Ja" : "Nej"}
                      </td>
                      <td className="px-4 py-3">
                        {profile.payment_status === "paid" ? (
                          <button
                            onClick={() => updatePaymentStatus(profile.id, "unpaid")}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
                          >
                            Sätt ej betald
                          </button>
                        ) : (
                          <button
                            onClick={() => updatePaymentStatus(profile.id, "paid")}
                            className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                          >
                            Sätt betald
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}