import Link from "next/link";

type HelpSectionProps = {
  title: string;
  children: React.ReactNode;
};

function HelpSection({ title, children }: HelpSectionProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
        {title}
      </h2>
      <div className="mt-3 text-sm leading-7 text-slate-700 md:text-base space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_35%,_#f1f5f9_68%,_#e2e8f0_100%)] px-4 py-6 sm:px-6 md:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-gradient-to-r from-emerald-950 via-green-900 to-slate-950 p-6 text-white">
          <h1 className="text-3xl font-black sm:text-4xl">Hjälp</h1>
          <p className="mt-3 text-sm text-slate-200">
            Så använder du Addes VM-tips – steg för steg.
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

          <HelpSection title="1. Fyll i ditt tips">
            <p>Gå till <strong>Grupper</strong> och välj grupp A–L.</p>
            <p>Skriv in resultat i matcherna. Tabellen uppdateras automatiskt.</p>
            <p>När grupperna är klara byggs slutspelet upp automatiskt.</p>
          </HelpSection>

          <HelpSection title="2. Slutspelet">
            <p>Under <strong>Slutspel</strong> väljer du vinnare i varje match.</p>
            <p>Du tippar hela vägen till världsmästare.</p>
          </HelpSection>

          <HelpSection title="3. Spara ditt tips">
            <p>Klicka på <strong>Spara tips</strong> högst upp.</p>
            <p>Gör du ändringar måste du spara igen.</p>
          </HelpSection>

          <HelpSection title="4. Betalning">
            <p>Om du står som <strong>Ej betald</strong> behöver du swisha:</p>
            <p className="font-bold text-emerald-700">
              070-3222546
            </p>
            <p>Märk betalningen med din <strong>unika kod</strong>.</p>
          </HelpSection>

          <HelpSection title="5. Lag & spelare (viktig!)">
            <p>
              För att se laginformation:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Klicka på <strong>Lag & spelare</strong> i menyn</li>
              <li>Välj ett lag</li>
              <li>Du får upp:</li>
            </ul>
            <ul className="list-disc pl-8 space-y-1">
              <li>Trolig startelva</li>
              <li>Trupp</li>
              <li>Laginfo</li>
              <li>Vägen till VM</li>
            </ul>
          </HelpSection>

          <HelpSection title="6. Matcher idag">
            <p>På startsidan ser du dagens matcher.</p>
            <p>Klicka på <strong>Öppna matchdag</strong> för hela schemat.</p>
          </HelpSection>

          <HelpSection title="7. Ligor">
            <p>Skapa egen liga eller gå med via kod.</p>
            <p>Alla använder samma tips som i huvudtävlingen.</p>
          </HelpSection>

          <HelpSection title="8. Mitt resultat">
            <p>Här ser du:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dina poäng</li>
              <li>Poängfördelning</li>
              <li>Senaste sparning</li>
            </ul>
          </HelpSection>

        </div>
      </div>
    </main>
  );
}