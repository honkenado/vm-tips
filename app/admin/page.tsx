"use client";

import { useEffect, useState } from "react";
import { getGroupStageSchedule } from "@/lib/match-schedule";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  payment_code: string | null;
  payment_status: "paid" | "unpaid";
  is_admin: boolean;
};

type AdminTab = "payments" | "goldenBoot" | "matchBet";

type GoldenBootEntry = {
  user_id: string;
  name: string;
  payment_status: "paid" | "unpaid";
  golden_boot: string;
  golden_boot_corrected: string | null;
};

type GoldenBootRowProps = {
  entry: GoldenBootEntry;
  onSave: (userId: string, correctedGoldenBoot: string) => Promise<void>;
};

type MatchBetHistory = {
  id: string;
  match_number: number;
  market: string;
  selection: string;
  odds: number;
  result_status: "pending" | "won" | "lost" | "void";
};

type MatchBetStats = {
  total: number;
  pending: number;
  won: number;
  lost: number;
  voided: number;
  profit: number;
  roi: number;
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
  const schedule = getGroupStageSchedule();
const [betMatchNumber, setBetMatchNumber] = useState("");
  const [betMarket, setBetMarket] = useState("");
const [betSelection, setBetSelection] = useState("");
const [betOdds, setBetOdds] = useState("");
const [betComment, setBetComment] = useState("");
const [savingBet, setSavingBet] = useState(false);
const [betHistory, setBetHistory] = useState<MatchBetHistory[]>([]);
const [betStats, setBetStats] = useState<MatchBetStats | null>(null);

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

  async function saveMatchBet() {
  try {
    setSavingBet(true);
    setMessage(null);

    const res = await fetch("/api/admin/match-bet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  matchNumber: Number(betMatchNumber),
  market: betMarket,
  selection: betSelection,
  odds: Number(betOdds),
  comment: betComment,
}),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Kunde inte spara Matchens Bet");
      return;
    }

    setMessage("Matchens Bet sparad");
  } catch (error) {
    console.error(error);
    setMessage("Något gick fel");
  } finally {
    setSavingBet(false);
  }
}
async function deleteMatchBet() {
  try {
    setSavingBet(true);
    setMessage(null);

    const res = await fetch("/api/admin/match-bet", {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Kunde inte ta bort Matchens Bet");
      return;
    }

    setBetMatchNumber("");
    setBetMarket("");
    setBetSelection("");
    setBetOdds("");
    setBetComment("");

    setMessage("Matchens Bet borttagen från startsidan");
  } catch (error) {
    console.error(error);
    setMessage("Något gick fel");
  } finally {
    setSavingBet(false);
  }
}

async function loadBetHistory() {
  try {
    const res = await fetch("/api/admin/match-bet", {
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) return;

    setBetHistory(data.bets ?? []);
    setBetStats(data.stats ?? null);
  } catch (error) {
    console.error(error);
  }
}

async function settleBet(
  betId: string,
  resultStatus: "won" | "lost" | "void"
) {
  try {
    const res = await fetch("/api/admin/match-bet", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        betId,
        resultStatus,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Kunde inte rätta spelet");
      return;
    }

    await loadBetHistory();
    setMessage("Spel rättat");
  } catch (error) {
    console.error(error);
  }
}

  useEffect(() => {
  loadProfiles();
  loadGoldenBootData();
  loadBetHistory();
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
            <button
  onClick={() => setActiveTab("matchBet")}
  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
    activeTab === "matchBet"
      ? "bg-slate-900 text-white"
      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
  }`}
>
  Matchens Bet
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
       {activeTab === "matchBet" && (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-xl font-black text-slate-900">🎯 Matchens Bet</h2>

    <p className="mt-2 text-sm text-slate-600">
      Välj vilken match spelet hör till och fyll i marknad, spel och odds.
    </p>

    {betStats && (
  <div className="mt-4 rounded-2xl bg-slate-100 p-4">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
      <div>
        <div className="text-xs text-slate-500">Spel</div>
        <div className="font-black">{betStats.total}</div>
      </div>

      <div>
        <div className="text-xs text-slate-500">Vinster</div>
        <div className="font-black text-emerald-600">
          {betStats.won}
        </div>
      </div>

      <div>
        <div className="text-xs text-slate-500">Förluster</div>
        <div className="font-black text-red-600">
          {betStats.lost}
        </div>
      </div>

      <div>
        <div className="text-xs text-slate-500">Pågående</div>
        <div className="font-black">
          {betStats.pending}
        </div>
      </div>

      <div>
        <div className="text-xs text-slate-500">Units</div>
        <div className="font-black">
          {betStats.profit.toFixed(2)}
        </div>
      </div>

      <div>
        <div className="text-xs text-slate-500">ROI</div>
        <div className="font-black">
          {betStats.roi.toFixed(1)}%
        </div>
      </div>
    </div>
  </div>
)}

    <div className="mt-6 space-y-5">
      <div>
        <label className="mb-2 block text-sm font-bold text-slate-800">
          Match
        </label>
        <select
          value={betMatchNumber}
          onChange={(e) => setBetMatchNumber(e.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Välj match...</option>
          {schedule.map((match) => (
            <option key={match.matchNumber} value={match.matchNumber}>
              {match.date} {match.time} · {match.homeTeam} – {match.awayTeam}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-800">
          Marknad
        </label>
        <input
          type="text"
          value={betMarket}
          onChange={(e) => setBetMarket(e.target.value)}
          placeholder="T.ex. Under 2,5"
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-800">
          Spel
        </label>
        <input
          type="text"
          value={betSelection}
          onChange={(e) => setBetSelection(e.target.value)}
          placeholder="T.ex. Belgien–Egypten under 2,5"
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-800">
          Odds
        </label>
        <input
          type="text"
          value={betOdds}
          onChange={(e) => setBetOdds(e.target.value)}
          placeholder="T.ex. 1.90"
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-800">
          Motivering
        </label>
        <textarea
          value={betComment}
          onChange={(e) => setBetComment(e.target.value)}
          placeholder="Valfri kort motivering..."
          rows={4}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
  <button
    onClick={saveMatchBet}
    disabled={savingBet}
    className="rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
  >
    {savingBet ? "Sparar..." : "Spara Matchens Bet"}
  </button>

  <button
    type="button"
    onClick={deleteMatchBet}
    disabled={savingBet}
    className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
  >
    🗑 Ta bort Matchens Bet
  </button>
</div>
    </div>

    <div className="mt-8 border-t pt-6">
  <h3 className="mb-4 text-lg font-black">
    Historik
  </h3>

  <div className="space-y-3">
    {betHistory.map((bet) => (
      <div
        key={bet.id}
        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <div className="text-sm font-black text-slate-900">
          Match {bet.match_number}
        </div>

        <div className="mt-1 text-sm font-bold text-slate-700">
          {bet.market}
        </div>

        <div className="mt-1 text-sm font-semibold text-slate-900">
          {bet.selection}
        </div>

        <div className="mt-1 text-sm font-bold text-emerald-700">
          Odds {bet.odds}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => settleBet(bet.id, "won")}
            className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white"
          >
            Vinst
          </button>

          <button
            onClick={() => settleBet(bet.id, "lost")}
            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white"
          >
            Förlust
          </button>

          <button
            onClick={() => settleBet(bet.id, "void")}
            className="rounded-lg bg-slate-600 px-3 py-1 text-xs font-bold text-white"
          >
            Void
          </button>

          <span className="ml-auto rounded-full bg-slate-200 px-2 py-1 text-xs font-black uppercase text-slate-700">
            {bet.result_status}
          </span>
        </div>
      </div>
    ))}
  </div>
</div>
  </div>
)}
      </div>
    </main>
  );
}