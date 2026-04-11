"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type HelpItem = {
  section: string;
  question: string;
  answer: React.ReactNode;
};

function HelpAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: HelpItem;
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
            {item.question}
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
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const helpItems: HelpItem[] = [
    {
      section: "Kom igång",
      question: "Hur lägger jag mitt tips?",
      answer: (
        <>
          Gå till <strong className="text-white">Gå till tipset</strong>, fyll i
          matcherna i gruppspelet, välj lag vidare till slutspelet och välj
          skytteligavinnare. Klicka sedan på{" "}
          <strong className="text-white">Spara tips</strong>.
        </>
      ),
    },
    {
      section: "Kom igång",
      question: "Kan jag ändra mitt tips?",
      answer: (
        <>
          Ja, du kan ändra ditt tips fram till{" "}
          <strong className="text-white">deadline</strong>. Kom ihåg att spara
          igen efter varje ändring.
        </>
      ),
    },
    {
      section: "Kom igång",
      question: "När är deadline?",
      answer: (
        <>
          Deadline är{" "}
          <strong className="text-white">10 juni kl. 23:00</strong>. När
          deadline passerat låses tipsen automatiskt.
        </>
      ),
    },
    {
      section: "Poäng",
      question: "Hur fungerar poängen i gruppspelet?",
      answer: (
        <ul className="space-y-2">
          <li>
            • Rätt utfall i matchen (1X2):{" "}
            <strong className="text-white">3 poäng</strong>
          </li>
          <li>
            • Exakt resultat: <strong className="text-white">+1 poäng</strong>
          </li>
          <li>
            • Max per match: <strong className="text-white">4 poäng</strong>
          </li>
          <li>
            • Rätt tabellplacering per lag:{" "}
            <strong className="text-white">1 poäng</strong>
          </li>
        </ul>
      ),
    },
    {
      section: "Poäng",
      question: "Hur fungerar poängen i slutspelet?",
      answer: (
        <ul className="space-y-2">
          <li>
            • Rätt lag i R32: <strong className="text-white">1 poäng / lag</strong>
          </li>
          <li>
            • Rätt lag i R16: <strong className="text-white">2 poäng / lag</strong>
          </li>
          <li>
            • Rätt lag i Kvartsfinal:{" "}
            <strong className="text-white">3 poäng / lag</strong>
          </li>
          <li>
            • Rätt lag i Semifinal:{" "}
            <strong className="text-white">4 poäng / lag</strong>
          </li>
          <li>
            • Rätt lag i Final: <strong className="text-white">7 poäng / lag</strong>
          </li>
          <li>
            • Rätt världsmästare: <strong className="text-white">12 poäng</strong>
          </li>
          <li>
            • Rätt Golden Boot: <strong className="text-white">7 poäng</strong>
          </li>
        </ul>
      ),
    },
    {
      section: "Poäng",
      question: "Varför har jag 0 poäng i ligan?",
      answer: (
        <>
          Det beror oftast på att du inte är markerad som{" "}
          <strong className="text-white">betald</strong> ännu. Obetalda deltagare
          visas med 0 poäng tills betalningen registrerats.
        </>
      ),
    },
    {
      section: "Betalning",
      question: "Hur betalar jag?",
      answer: (
        <>
          Swisha till:
          <br />
          <span className="mt-2 inline-block text-lg font-black text-emerald-300">
            070-3222546
          </span>
          <br />
          Märk betalningen med din{" "}
          <strong className="text-white">unika kod</strong> i appen.
        </>
      ),
    },
    {
      section: "Betalning",
      question: "Hur mycket kostar det?",
      answer: (
        <>
          Total kostnad är{" "}
          <strong className="text-white">170 kr</strong>.
          <br />
          Det består av:
          <br />• Deltagaravgift: 150 kr
          <br />• Administrativ avgift: 20 kr
        </>
      ),
    },
    {
      section: "Betalning",
      question: "Vad händer om jag inte betalar?",
      answer: (
        <>
          Du kan fortfarande bygga ditt tips i appen, men du räknas inte fullt ut i
          tävlingen eller i kompisligor. Efter deadline kan obetalda deltagare tas
          bort från leaderboard och ligor.
        </>
      ),
    },
    {
      section: "Ligor",
      question: "Hur skapar jag en liga?",
      answer: (
        <>
          Gå till <strong className="text-white">Ligor</strong>, skriv in ett
          namn och klicka på <strong className="text-white">Skapa liga</strong>.
          Därefter kan du dela ligakoden med andra.
        </>
      ),
    },
    {
      section: "Ligor",
      question: "Hur går jag med i en liga?",
      answer: (
        <>
          Gå till <strong className="text-white">Ligor</strong>, skriv in
          ligakoden och klicka på{" "}
          <strong className="text-white">Gå med i liga</strong>.
        </>
      ),
    },
    {
      section: "Ligor",
      question: "Vad är huvudligan?",
      answer: (
        <>
          Huvudligan är den officiella stora ligan där alla deltagare jämförs.
          Kompisligor är egna privata ligor med samma tips som i huvudtävlingen.
        </>
      ),
    },
    {
      section: "Tips",
      question: "Hur fungerar gruppspelet i appen?",
      answer: (
        <>
          Du fyller i exakta resultat i gruppmatcherna. Tabellen räknas ut
          automatiskt och slutspelet byggs sedan upp utifrån dina gruppspelstips.
        </>
      ),
    },
    {
      section: "Tips",
      question: "Hur fungerar slutspelet i appen?",
      answer: (
        <>
          Under <strong className="text-white">Slutspel</strong> väljer du vilka
          lag som går vidare i varje match hela vägen fram till världsmästaren.
        </>
      ),
    },
    {
      section: "Tips",
      question: "Vad är Adde Boy?",
      answer: (
        <>
          Adde Boy fyller gruppspelet automatiskt med ett slumpat tips som du kan
          använda som grund eller köra rakt av.
        </>
      ),
    },
    {
      section: "Funktioner",
      question: "Vad hittar jag under Lag & spelare?",
      answer: (
        <>
          Där kan du läsa mer om lagen i turneringen och se exempelvis:
          <br />• Trolig startelva
          <br />• Trupp
          <br />• Laginfo
          <br />• Vägen till VM
        </>
      ),
    },
    {
      section: "Funktioner",
      question: "Vad är Mitt resultat?",
      answer: (
        <>
          Där ser du bland annat:
          <br />• Dina poäng
          <br />• Poängfördelning
          <br />• Ditt sparade resultat
        </>
      ),
    },
    {
      section: "Värvning",
      question: "Hur fungerar värvningssystemet?",
      answer: (
        <>
          Dela din personliga länk. När någon registrerar sig via din länk och
          sedan blir betalande räknas värvningen på dig.
        </>
      ),
    },
    {
      section: "Värvning",
      question: "Vad kan jag vinna i värvarligan?",
      answer: (
        <>
          Topp 1 och topp 2 får ersättning per betalande värvning enligt reglerna.
          Max ersättning per person är{" "}
          <strong className="text-white">500 kr</strong>.
        </>
      ),
    },
    {
      section: "Problem",
      question: "Jag kan inte spara mitt tips",
      answer: (
        <>
          Kontrollera att deadline inte passerat. Om deadline gått ut låses systemet
          automatiskt.
        </>
      ),
    },
    {
      section: "Problem",
      question: "Jag ser inga ligor",
      answer: (
        <>
          Gå till <strong className="text-white">Ligor</strong> och skapa en egen
          eller gå med via ligakod.
        </>
      ),
    },
    {
      section: "Problem",
      question: "Chatten funkar inte",
      answer: (
        <>
          Du måste vara <strong className="text-white">inloggad</strong> för att
          skriva i chatten.
        </>
      ),
    },
    {
      section: "Problem",
      question: "Sidan ser konstig ut i mobilen",
      answer: (
        <>
          Börja med att ladda om sidan. Om problemet kvarstår får du kontakta admin.
        </>
      ),
    },
  ];

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return helpItems;

    return helpItems.filter((item) => {
      const plainText = `${item.section} ${item.question}`.toLowerCase();
      return plainText.includes(q);
    });
  }, [query, helpItems]);

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
                Support & FAQ
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                Hjälp
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/78 md:text-base">
                Här hittar du snabba svar på hur appen fungerar – från tips,
                poäng och betalning till ligor, värvningar och vanliga problem.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/"
                  className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  Till startsidan
                </Link>
                <Link
                  href="/rules"
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Regler
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[1.75rem] border border-emerald-400/15 bg-emerald-500/10 p-5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <h2 className="text-lg font-black">Snabbt att komma ihåg</h2>
          <div className="mt-3 grid gap-3 text-sm leading-6 text-white/78 md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              • Deadline: <strong className="text-white">10 juni kl. 23:00</strong>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              • Total avgift: <strong className="text-white">170 kr</strong>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              • Rätt utfall ger <strong className="text-white">3 poäng</strong>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              • Exakt resultat ger <strong className="text-white">+1 bonus</strong>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <label htmlFor="help-search" className="sr-only">
            Sök i hjälpen
          </label>
          <input
            id="help-search"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpenIndex(0);
            }}
            placeholder="Sök efter poäng, betalning, deadline, ligor..."
            className="w-full rounded-2xl border border-white/10 bg-[#020617]/70 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-emerald-400/60 focus:outline-none"
          />
        </div>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6 text-sm text-white/70 backdrop-blur-xl">
              Inget i hjälpen matchade din sökning.
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <HelpAccordionItem
                key={`${item.section}-${item.question}`}
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