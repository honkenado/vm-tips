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

type AdminTab = "payments" | "goldenBoot";

type GoldenBootEntry = {
  user_id: string;
  name: string;
  payment_status: "paid" | "unpaid";
  golden_boot: string;
  golden_boot_corrected: string;
};

type GoldenBootRowProps = {
  entry: GoldenBootEntry;
  onSave: (userId: string, correctedGoldenBoot: string) => Promise<void>;
};

function GoldenBootRow({ entry, onSave }: GoldenBootRowProps) {
  const [value, setValue] = useState(
    entry.golden_boot_corrected || entry.golden_boot
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      await onSave(entry.user_id, value);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-bold text-slate-900">{entry.name}</div>
          <div className="text-xs text-slate-500">
            Originaltips: {entry.golden_boot || "Inget angivet"}
          </div>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold ${
            entry.payment_status === "paid"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {entry.payment_status === "paid" ? "Betalande" : "Ej betalande"}
        </span>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Rätta till spelarens namn..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Sparar..." : "Spara rättning"}
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("payments");

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const [goldenBootEntries, setGoldenBootEntries] = useState<GoldenBootEntry[]>(
    []
  );
  const [officialGoldenBoot, setOfficialGoldenBoot] = useState("");
  const [goldenBootLoading, setGoldenBootLoading] = useState(true);
  const [savingOfficialGoldenBoot, setSavingOfficialGoldenBoot] = useState(false);

  const [message, setMessage] = useState<string | null>(null);

  async function loadProfiles() {
    try {
      setPaymentsLoading(true);
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
      setPaymentsLoading(false);
    }
  }

  async function loadGoldenBootData() {
    try {
      setGoldenBootLoading(true);
      setMessage(null);

      const res = await fetch("/api/admin/golden-boot", {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte läsa skyttekung");
        return;
      }

      setGoldenBootEntries(data.entries ?? []);
      setOfficialGoldenBoot(data.officialGoldenBoot ?? "");
    } catch (error) {
      console.error(error);
      setMessage("Något gick fel");
    } finally {
      setGoldenBootLoading(false);
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

      setGoldenBootEntries((prev) =>
        prev.map((entry) =>
          entry.user_id === profileId
            ? { ...entry, payment_status: paymentStatus }
            : entry
        )
      );

      setMessage("Betalstatus uppdaterad");
    } catch (error) {
      console.error(error);
      setMessage("Något gick fel");
    }
  }

  async function saveCorrectedGoldenBoot(
    userId: string,
    correctedGoldenBoot: string
  ) {
    try {
      setMessage(null);

      const res = await fetch("/api/admin/golden-boot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "prediction",
          userId,
          correctedGoldenBoot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte spara rättning");
        return;
      }

      setGoldenBootEntries((prev) =>
        prev.map((entry) =>
          entry.user_id === userId
            ? { ...entry, golden_boot_corrected: correctedGoldenBoot }
            : entry
        )
      );

      setMessage("Rättning sparad");
    } catch (error) {
      console.error(error);
      setMessage("Något gick fel");
    }
  }

  async function saveOfficialGoldenBoot() {
    try {
      setSavingOfficialGoldenBoot(true);
      setMessage(null);

      const res = await fetch("/api/admin/golden-boot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "official",
          officialGoldenBoot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Kunde inte spara officiell skyttekung");
        return;
      }

      setMessage("Officiell skyttekung sparad");
    } catch (error) {
      console.error(error);
      setMessage("Något gick fel");
    } finally {
      setSavingOfficialGoldenBoot(false);
    }
  }

  useEffect(() => {
    loadProfiles();
    loadGoldenBootData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Admin</h1>
              <p className="mt-2 text-slate-600">
                Hantera betalstatus, nyheter och skyttekung.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href="/admin/news"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Skriv nyhet
              </a>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("payments")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                activeTab === "payments"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Betalstatus
            </button>

            <button
              onClick={() => setActiveTab("goldenBoot")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                activeTab === "goldenBoot"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Skyttekung
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        {activeTab === "payments" && (
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
                  {paymentsLoading ? (
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
                            {profile.payment_status === "paid"
                              ? "Betald"
                              : "Ej betald"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {profile.is_admin ? "Ja" : "Nej"}
                        </td>
                        <td className="px-4 py-3">
                          {profile.payment_status === "paid" ? (
                            <button
                              onClick={() =>
                                updatePaymentStatus(profile.id, "unpaid")
                              }
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
                            >
                              Sätt ej betald
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                updatePaymentStatus(profile.id, "paid")
                              }
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
        )}

        {activeTab === "goldenBoot" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">
                Officiell skyttekung
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                När turneringen är avgjord lägger du in rätt spelare här. Då kan
                poäng delas ut automatiskt.
              </p>

              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  value={officialGoldenBoot}
                  onChange={(e) => setOfficialGoldenBoot(e.target.value)}
                  placeholder="Skriv officiell skyttekung..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                />

                <button
                  onClick={saveOfficialGoldenBoot}
                  disabled={savingOfficialGoldenBoot}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {savingOfficialGoldenBoot
                    ? "Sparar..."
                    : "Spara officiell"}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">
                Rätta användarnas skyttekungstips
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Här kan du rätta felstavningar, smeknamn eller skriva in korrekt
                spelarnamn utan att förstöra originaltipset.
              </p>

              <div className="mt-6 space-y-3">
                {goldenBootLoading ? (
                  <div className="text-sm text-slate-500">
                    Laddar skyttekungstips...
                  </div>
                ) : goldenBootEntries.length === 0 ? (
                  <div className="text-sm text-slate-500">
                    Inga skyttekungstips hittades ännu.
                  </div>
                ) : (
                  goldenBootEntries.map((entry) => (
                    <GoldenBootRow
                      key={entry.user_id}
                      entry={entry}
                      onSave={saveCorrectedGoldenBoot}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}