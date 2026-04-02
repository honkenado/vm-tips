import Link from "next/link";

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-100 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-emerald-200 bg-gradient-to-r from-emerald-900 via-green-900 to-slate-950 px-6 py-6 text-white md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              Officiellt regelverk
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Regelbok – Addes VM-tips 2026
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 md:text-base">
              Här hittar du allt som gäller för årets upplaga – från deadline och
              betalning till poängsystem, kompisligor och hur tipsen låses.
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
          </div>

          <div className="bg-gradient-to-b from-white to-slate-50 px-6 py-4 md:px-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                Deadline: 10 juni 23:00
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Avgift: 170 kr
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Allt sker i appen
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-[1.75rem] border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Kortversion</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            <li>• Tippa och spara ditt tips direkt i appen.</li>
            <li>• Deadline är 10 juni kl. 23:00.</li>
            <li>• Total avgift är 170 kr och swishas till 070-3222546.</li>
            <li>• Märk betalningen med din unika kod i appen.</li>
            <li>• Obetalda deltagare räknas inte och tas bort efter deadline.</li>
            <li>• Kompisligor kräver att alla deltagare också är med i huvudligan.</li>
          </ul>
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Välkommen
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
              Välkommen till årets upplaga av Addes VM-tips. I år sker allt direkt i
              appen – från registrering och sparande av tips till leaderboard,
              nyheter, laginfo och kompisligor.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
              Du tippar hela turneringen, följer din placering löpande och tävlar
              både i huvudligan och, om du vill, i egna kompisligor.
            </p>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Deadline
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
              <strong>Deadline för att spara sitt tips är den 10 juni kl. 23:00.</strong>
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
              När deadline passerat låses systemet automatiskt. Det tips du har sparat
              i appen vid den tidpunkten är det tips som gäller.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
              Det går alltså <strong>inte</strong> att lämna in tips via mail, sms
              eller annat manuellt efter deadline.
            </p>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Deltagande och betalning
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
              Alla kan skapa konto och bygga sitt tips i appen. För att räknas i
              tävlingen måste du dock ha genomfört betalningen.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-lg font-bold text-slate-900">Avgift</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>• Deltagaravgift: <strong>150 kr</strong></li>
                  <li>• Administrativ avgift: <strong>20 kr</strong></li>
                  <li>• Total kostnad: <strong>170 kr</strong></li>
                </ul>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <h3 className="text-lg font-bold text-slate-900">Betalning</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Betalning sker via Swish:
                </p>
                <p className="mt-2 text-lg font-black text-emerald-700">
                  070-3222546
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Märk betalningen med din <strong>unika kod</strong>, som visas på
                  din sida i appen.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Om betalning inte är registrerad kan du fortfarande ha konto och bygga
              ditt tips, men du räknas <strong>inte</strong> i tävlingen eller i
              kompisligor. Efter deadline kommer obetalda deltagare inte visas med
              poäng och kan tas bort från leaderboard.
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Så fungerar tipset
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <h3 className="text-lg font-bold text-slate-900">Gruppspelet</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Du tippar <strong>exakta resultat</strong> i samtliga gruppmatcher.
                  Tabellerna räknas automatiskt ut av systemet.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Du får även poäng för korrekt slutplacering i grupperna.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-lg font-bold text-slate-900">Slutspelet</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  I slutspelet väljer du vilka lag som går vidare och vinner sina
                  matcher enligt turneringsträdet.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Systemet genererar slutspelsträdet automatiskt utifrån
                  gruppspelsresultaten.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Adde Boy
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
              För dig som vill ha hjälp i sann Harry Boy-anda finns knappen{" "}
              <strong>Adde Boy</strong>.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
              När du klickar på den fylls hela gruppspelet i automatiskt med ett
              slumpat tips som kan användas som grund eller köras rakt av.
            </p>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Poängsystem
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-lg font-bold text-slate-900">Gruppspel</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                  <li>• Rätt utfall i matchen (1X2): <strong>3 poäng</strong></li>
                  <li>• Exakt resultat: <strong>+1 poäng</strong></li>
                  <li>• Max: <strong>4 poäng per match</strong></li>
                  <li>• Rätt tabellplacering per lag: <strong>1 poäng</strong></li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-lg font-bold text-slate-900">Slutspel & bonus</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                  <li>• Rätt lag i R32: <strong>1 poäng / lag</strong></li>
                  <li>• Rätt lag i R16: <strong>2 poäng / lag</strong></li>
                  <li>• Rätt lag i Kvartsfinal: <strong>3 poäng / lag</strong></li>
                  <li>• Rätt lag i Semifinal: <strong>4 poäng / lag</strong></li>
                  <li>• Rätt lag i Final: <strong>7 poäng / lag</strong></li>
                  <li>• Rätt världsmästare: <strong>12 poäng</strong></li>
                  <li>• Rätt Golden Boot: <strong>7 poäng</strong></li>
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Kompisligor
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
              Det går att skapa egna kompisligor i appen.
            </p>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-lg font-bold text-slate-900">Regler</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                <li>• Alla deltagare måste även delta i huvudtävlingen</li>
                <li>• Alla deltagare måste ha betalat avgiften</li>
              </ul>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Deltagare som inte har betalat kommer inte visas med poäng och kan
              tas bort från både kompisligor och huvudligan efter deadline.
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-lg font-bold text-slate-900">Funktioner</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                <li>• Skapa liga</li>
                <li>• Dela kod</li>
                <li>• Gå med i liga</li>
                <li>• Alla använder samma tips som i huvudtävlingen</li>
              </ul>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Leaderboard
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
              Det finns en global leaderboard samt separata leaderboards för varje
              kompisliga.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
              Vid lika poäng används följande ordning:
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>Totalpoäng</li>
              <li>Måldifferens / tiebreaker</li>
              <li>Namn i alfabetisk ordning</li>
            </ol>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Kommunikation
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
              All kommunikation sker i appen via <strong>Senaste nytt</strong>.
            </p>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Viktigt att komma ihåg
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              <li>• Endast sparade tips gäller</li>
              <li>• Deadline: 10 juni 23:00</li>
              <li>• Betalning krävs för att delta</li>
              <li>• Swish: 070-3222546</li>
              <li>• Märk betalningen med din unika kod</li>
              <li>• Obetalda kan tas bort efter deadline</li>
              <li>• Kompisligor kräver betalande deltagare</li>
            </ul>
          </section>

          <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Sammanfattning
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
              Ett helt automatiserat VM-tips där allt sker i appen.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
              Du tippar, sparar och betalar direkt i systemet – sedan låses allt
              vid deadline.
            </p>
            <p className="mt-3 text-sm leading-7 font-semibold text-emerald-800 md:text-base">
              Enkelt, tydligt och rättvist. Lycka till!
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}