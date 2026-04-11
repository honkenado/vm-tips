"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type RuleItem = {
  section: string;
  title: string;
  content: React.ReactNode;
};

function RuleAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: RuleItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl transition">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
      >
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-emerald-400/90">
            {item.section}
          </p>
          <h2 className="mt-1 text-base font-black text-white sm:text-lg">
            {item.title}
          </h2>
        </div>

        <span
          className={`shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm font-bold text-white/80 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ˅
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/8 px-4 py-4 text-sm leading-7 text-white/78 sm:px-5 md:text-[15px]">
            {item.content}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RulesPage() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const ruleItems: RuleItem[] = [
    {
      section: "Översikt",
      title: "Vad gäller för Addes VM-tips 2026?",
      content: (
        <>
          Addes VM-tips 2026 är ett helt digitalt VM-tips där allt sker direkt i
          appen. Du registrerar konto, bygger ditt tips, sparar det, följer din
          placering och tävlar både i huvudligan och i egna kompisligor.
        </>
      ),
    },
    {
      section: "Deadline",
      title: "När låses tipsen?",
      content: (
        <>
          <strong className="text-white">Deadline är 10 juni kl. 23:00.</strong>
          <br />
          När deadline passerat låses systemet automatiskt. Det tips som är sparat
          i appen vid den tidpunkten är det som gäller.
        </>
      ),
    },
    {
      section: "Deadline",
      title: "Kan jag lämna in eller ändra efter deadline?",
      content: (
        <>
          Nej. Det går inte att lämna in eller ändra tips via sms, mail eller manuellt
          efter deadline. Endast det som är sparat i appen innan låsningen gäller.
        </>
      ),
    },
    {
      section: "Betalning",
      title: "Vad kostar det att vara med?",
      content: (
        <ul className="space-y-2">
          <li>• Deltagaravgift: <strong className="text-white">150 kr</strong></li>
          <li>• Administrativ avgift: <strong className="text-white">20 kr</strong></li>
          <li>• Total kostnad: <strong className="text-white">170 kr</strong></li>
        </ul>
      ),
    },
    {
      section: "Betalning",
      title: "Hur betalar jag?",
      content: (
        <>
          Betalning sker via Swish till:
          <br />
          <span className="mt-2 inline-block text-lg font-black text-emerald-300">
            070-3222546
          </span>
          <br />
          Märk betalningen med din <strong className="text-white">unika kod</strong>
          , som visas i appen.
        </>
      ),
    },
    {
      section: "Betalning",
      title: "Vad händer om jag inte betalat?",
      content: (
        <>
          Du kan fortfarande skapa konto och bygga ditt tips, men du räknas inte i
          tävlingen eller i kompisligor förrän betalningen är registrerad. Efter
          deadline kan obetalda deltagare döljas från leaderboard och tas bort.
        </>
      ),
    },
    {
      section: "Tips",
      title: "Hur fungerar gruppspelet?",
      content: (
        <>
          Du tippar <strong className="text-white">exakta resultat</strong> i alla
          gruppmatcher. Tabellerna räknas automatiskt ut av systemet.
        </>
      ),
    },
    {
      section: "Tips",
      title: "Hur fungerar slutspelet?",
      content: (
        <>
          I slutspelet väljer du vilka lag som går vidare och vinner sina matcher i
          turneringsträdet. Systemet bygger slutspelet automatiskt utifrån dina
          gruppspelstips.
        </>
      ),
    },
    {
      section: "Tips",
      title: "Vad är Adde Boy?",
      content: (
        <>
          Adde Boy är din snabbknapp för ett automatiskt tips i sann Harry Boy-anda.
          Den fyller gruppspelet med ett slumpat tips som du kan använda direkt eller
          justera innan du sparar.
        </>
      ),
    },
    {
      section: "Poängsystem",
      title: "Hur räknas poängen i gruppspelet?",
      content: (
        <ul className="space-y-2">
          <li>• Rätt utfall i matchen (1X2): <strong className="text-white">3 poäng</strong></li>
          <li>• Exakt resultat: <strong className="text-white">+1 poäng</strong></li>
          <li>• Max per match: <strong className="text-white">4 poäng</strong></li>
          <li>• Rätt tabellplacering per lag: <strong className="text-white">1 poäng</strong></li>
        </ul>
      ),
    },
    {
      section: "Poängsystem",
      title: "Hur räknas poängen i slutspelet och bonus?",
      content: (
        <ul className="space-y-2">
          <li>• Rätt lag i R32: <strong className="text-white">1 poäng / lag</strong></li>
          <li>• Rätt lag i R16: <strong className="text-white">2 poäng / lag</strong></li>
          <li>• Rätt lag i Kvartsfinal: <strong className="text-white">3 poäng / lag</strong></li>
          <li>• Rätt lag i Semifinal: <strong className="text-white">4 poäng / lag</strong></li>
          <li>• Rätt lag i Final: <strong className="text-white">7 poäng / lag</strong></li>
          <li>• Rätt världsmästare: <strong className="text-white">12 poäng</strong></li>
          <li>• Rätt Golden Boot: <strong className="text-white">7 poäng</strong></li>
        </ul>
      ),
    },
    {
      section: "Ligor",
      title: "Hur fungerar kompisligor?",
      content: (
        <>
          Du kan skapa egna kompisligor i appen. Alla deltagare i en kompisliga måste
          också delta i huvudtävlingen och ha betalat avgiften för att räknas fullt ut.
        </>
      ),
    },
    {
      section: "Ligor",
      title: "Vad gäller i kompisligor?",
      content: (
        <ul className="space-y-2">
          <li>• Alla deltagare måste även vara med i huvudtävlingen</li>
          <li>• Alla deltagare måste ha betalat avgiften</li>
          <li>• Alla använder samma tips som i huvudtävlingen</li>
          <li>• Obetalda deltagare kan tas bort eller visas utan poäng</li>
        </ul>
      ),
    },
    {
      section: "Leaderboard",
      title: "Hur avgörs placering vid lika poäng?",
      content: (
        <ol className="list-decimal space-y-2 pl-5">
          <li>Totalpoäng</li>
          <li>Måldifferens / tiebreaker</li>
          <li>Namn i alfabetisk ordning</li>
        </ol>
      ),
    },
    {
      section: "Kommunikation",
      title: "Var sker information och uppdateringar?",
      content: (
        <>
          All kommunikation sker i appen, främst via <strong className="text-white">Senaste nytt</strong>.
          Där publiceras uppdateringar, information och annat viktigt under turneringen.
        </>
      ),
    },
    {
      section: "Viktigt",
      title: "Vad måste jag komma ihåg?",
      content: (
        <ul className="space-y-2">
          <li>• Endast sparade tips gäller</li>
          <li>• Deadline är <strong className="text-white">10 juni 23:00</strong></li>
          <li>• Betalning krävs för att delta fullt ut</li>
          <li>• Swish: <strong className="text-white">070-3222546</strong></li>
          <li>• Märk betalningen med din unika kod</li>
          <li>• Obetalda deltagare kan tas bort efter deadline</li>
        </ul>
      ),
    },
  ];

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return ruleItems;

    return ruleItems.filter((item) => {
      const plainText =
        `${item.section} ${item.title}`.toLowerCase();

      return plainText.includes(q);
    });
  }, [query, ruleItems]);

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 sm:px-6 md:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 overflow-hidden rounded-[2rem] border border-white/8 bg-[#020617] text-white shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/6 bg-[#020617]">
            <div className="pointer-events-none absolute -left-28 -top-24 h-[420px] w-[420px] rounded-full bg-emerald-500/14 blur-[140px]" />
            <div className="pointer-events-none absolute right-0 top-0 h-[220px] w-[220px] rounded-full bg-emerald-300/8 blur-[100px]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02),transparent_35%,transparent_65%,rgba(16,185,129,0.03))]" />

            <div className="relative p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                Officiellt regelverk
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                Regler – Addes VM-tips 2026
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/78 md:text-base">
                Här hittar du allt som gäller för årets upplaga – deadline, betalning,
                poängsystem, kompisligor och hur tipsen låses.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/"
                  className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  Till startsidan
                </Link>
                <Link
                  href="/help"
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Hjälp
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-medium text-white/70">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-3 py-1 text-emerald-100">
                  Deadline: 10 juni 23:00
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                  Avgift: 170 kr
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                  Allt sker i appen
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[1.75rem] border border-emerald-400/15 bg-emerald-500/10 p-5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <h2 className="text-lg font-black">Kortversion</h2>
          <div className="mt-3 grid gap-3 text-sm leading-6 text-white/78 md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              • Tippa och spara ditt tips direkt i appen.
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              • Deadline är 10 juni kl. 23:00.
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              • Total avgift är 170 kr och swishas till 070-3222546.
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              • Märk betalningen med din unika kod i appen.
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <label htmlFor="rules-search" className="sr-only">
            Sök i regler
          </label>
          <input
            id="rules-search"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpenIndex(0);
            }}
            placeholder="Sök efter deadline, betalning, poäng, ligor..."
            className="w-full rounded-2xl border border-white/10 bg-[#020617]/70 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-emerald-400/60 focus:outline-none"
          />
        </div>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6 text-sm text-white/70 backdrop-blur-xl">
              Inga regler matchade din sökning.
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <RuleAccordionItem
                key={`${item.section}-${item.title}`}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}