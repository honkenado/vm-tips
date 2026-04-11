"use client";

import { useState } from "react";
import Link from "next/link";

type Item = {
  question: string;
  answer: React.ReactNode;
};

function Accordion({ items }: { items: Item[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i;

        return (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="font-bold text-slate-900">
                {item.question}
              </span>
              <span className="text-slate-400">
                {isOpen ? "–" : "+"}
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 text-sm text-slate-700 leading-6">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_35%,_#f1f5f9_68%,_#e2e8f0_100%)] px-4 py-6 sm:px-6 md:py-8">
      <div className="mx-auto max-w-4xl">
        
        {/* HEADER */}
        <div className="mb-6 rounded-[2rem] border border-emerald-950/10 bg-gradient-to-r from-emerald-950 via-green-900 to-slate-950 p-6 text-white">
          <h1 className="text-3xl font-black sm:text-4xl">Hjälp</h1>
          <p className="mt-3 text-sm text-slate-200">
            Snabba svar på hur appen fungerar.
          </p>

          <div className="mt-4 flex gap-2">
            <Link href="/" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900">
              Startsidan
            </Link>
            <Link href="/rules" className="rounded-full border border-white/20 px-4 py-2 text-sm">
              Regler
            </Link>
          </div>
        </div>

        <div className="space-y-6">

          {/* KOM IGÅNG */}
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-900">
              Kom igång
            </h2>

            <Accordion
              items={[
                {
                  question: "Hur lägger jag mitt tips?",
                  answer: (
                    <>
                      Gå till <strong>Grupper</strong>, fyll i matcher och välj lag vidare.
                      Klicka sedan på <strong>Spara tips</strong>.
                    </>
                  ),
                },
                {
                  question: "Kan jag ändra mitt tips?",
                  answer: <>Ja, fram till deadline.</>,
                },
                {
                  question: "När är deadline?",
                  answer: <>10 juni kl 23:59.</>,
                },
              ]}
            />
          </section>

          {/* POÄNG */}
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-900">
              Poäng & resultat
            </h2>

            <Accordion
              items={[
                {
                  question: "Hur får jag poäng?",
                  answer: (
                    <>
                      Rätt resultat = <strong>3 poäng</strong> <br />
                      Exakt resultat = <strong>+1 bonus</strong>
                    </>
                  ),
                },
                {
                  question: "Varför har jag 0 poäng?",
                  answer: (
                    <>
                      Du är troligen inte markerad som <strong>betald</strong>.
                    </>
                  ),
                },
              ]}
            />
          </section>

          {/* BETALNING */}
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-900">
              Betalning
            </h2>

            <Accordion
              items={[
                {
                  question: "Hur betalar jag?",
                  answer: (
                    <>
                      Swisha till:<br />
                      <span className="font-bold text-emerald-700">
                        070-3222546
                      </span>
                      <br />
                      Märk med din kod.
                    </>
                  ),
                },
              ]}
            />
          </section>

          {/* LIGOR */}
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-900">
              Ligor
            </h2>

            <Accordion
              items={[
                {
                  question: "Hur går jag med i en liga?",
                  answer: <>Gå till Ligor och ange kod.</>,
                },
                {
                  question: "Hur skapar jag en liga?",
                  answer: <>Skriv namn och klicka på Skapa.</>,
                },
              ]}
            />
          </section>

          {/* PROBLEM */}
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-900">
              Vanliga problem
            </h2>

            <Accordion
              items={[
                {
                  question: "Jag kan inte spara",
                  answer: <>Deadline kan ha passerat.</>,
                },
                {
                  question: "Jag ser inga ligor",
                  answer: <>Gå till Ligor och skapa en.</>,
                },
                {
                  question: "Chatten funkar inte",
                  answer: <>Du måste vara inloggad.</>,
                },
              ]}
            />
          </section>

        </div>
      </div>
    </main>
  );
}