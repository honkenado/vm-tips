import Image from "next/image";
import Link from "next/link";

function HelpImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <div className="relative w-full bg-slate-100 p-3">
        <div className="relative aspect-[16/6] w-full">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}

function HelpSection({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white shadow-sm">
          {step}
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          {title}
        </h2>
      </div>

      <div className="space-y-4 text-sm leading-7 text-slate-700 md:text-base">
        {children}
      </div>
    </section>
  );
}

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-100 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-emerald-200 bg-gradient-to-r from-emerald-900 via-green-900 to-slate-950 px-6 py-6 text-white md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              Hjälp & guide
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Så använder du Addes VM-tips
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 md:text-base">
              Här får du en snabb genomgång av hur appen fungerar – från att fylla
              i gruppspelet till att skapa ligor och spara ditt tips.
            </p>
          </div>

          <div className="bg-gradient-to-b from-white to-slate-50 px-6 py-4 md:px-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                Fyll i → spara → följ leaderboard
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Deadline låser allt
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Allt sker direkt i appen
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-[1.75rem] border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Snabbversion</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            <li>• Fyll i alla matcher i gruppspelet.</li>
            <li>• Tabellen räknas automatiskt.</li>
            <li>• Välj vinnare i slutspelet.</li>
            <li>• Spara ditt tips innan deadline.</li>
            <li>• Betalning krävs för att räknas i huvudliga och kompisligor.</li>
          </ul>
        </div>

        <div className="space-y-6">
          <HelpSection step="1" title="Översikt av startsidan">
            <p>
              Startsidan är navet i hela spelet. Här ser du din logga, dina
              viktigaste knappar och navigationen mellan de olika delarna.
            </p>
            <p>
              I toppen hittar du bland annat:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Regler</strong> – öppnar regelboken</li>
              <li><strong>Hjälp</strong> – den här guidesidan</li>
              <li><strong>Spara tips</strong> – sparar ditt nuvarande tips</li>
              <li><strong>Skapa liga</strong> – skapa en egen kompisliga</li>
              <li><strong>Gå med i liga</strong> – gå med via kod</li>
              <li><strong>Adde Boy</strong> – fyller gruppspelet automatiskt</li>
              <li><strong>Nollställ</strong> – rensar ditt tips</li>
            </ul>
            <p>
              Uppe till höger ser du också din betalstatus och din unika kod.
            </p>

            <HelpImage
              src="/help/header.png"
              alt="Översikt av startsidan i Addes VM-tips"
            />
          </HelpSection>

          <HelpSection step="2" title="Fyll i gruppspelet">
            <p>
              Under sektionen <strong>Grupper</strong> väljer du grupp och fyller i
              resultat för varje match.
            </p>
            <p>
              Så här fungerar det:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Du väljer grupp med knapparna Grupp A, Grupp B, Grupp C osv.</li>
              <li>För varje match fyller du i hemmalagets och bortalagets mål.</li>
              <li>Tabellen uppdateras automatiskt till höger.</li>
              <li>Du kan när som helst använda <strong>Nollställ grupp</strong>.</li>
            </ul>
            <p>
              När alla matcher i alla grupper är ifyllda räknar systemet fram
              tabeller, bästa treor och rätt lag till slutspelet.
            </p>

            <HelpImage
              src="/help/groups.png"
              alt="Gruppspel och live-tabell i Addes VM-tips"
            />
          </HelpSection>

          <HelpSection step="3" title="Live-tabellen">
            <p>
              Till höger om matcherna visas en <strong>live-tabell</strong> för den
              aktuella gruppen.
            </p>
            <p>
              Där ser du bland annat:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>matcher spelade</li>
              <li>vinster, oavgjorda och förluster</li>
              <li>gjorda och insläppta mål</li>
              <li>målskillnad</li>
              <li>poäng</li>
            </ul>
            <p>
              Färgerna hjälper dig snabbt att se gruppetta, grupptvåa och trea.
            </p>
          </HelpSection>

          <HelpSection step="4" title="Slutspelet">
            <p>
              När gruppspelet är klart låses slutspelet upp automatiskt.
            </p>
            <p>
              I slutspelsträdet väljer du vilket lag som går vidare från varje
              match. Du behöver alltså <strong>inte</strong> fylla i exakta resultat
              i slutspelet – bara rätt lag vidare.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>R32 visas först</li>
              <li>därefter R16, kvartsfinal, semifinal och final</li>
              <li>bronsmatch finns också med</li>
              <li>överst ser du fälten för guld, silver och brons</li>
            </ul>
            <p>
              Knapparna blir klickbara när lagen är klara från föregående runda.
            </p>

            <HelpImage
              src="/help/knockout.png"
              alt="Slutspelsträd i Addes VM-tips"
            />
          </HelpSection>

          <HelpSection step="5" title="Ligor och kompisligor">
            <p>
              Under sektionen <strong>Ligor</strong> ser du huvudligan och dina egna
              privata ligor.
            </p>
            <p>
              Så fungerar det:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Huvudligan</strong> är den officiella stora tävlingen</li>
              <li>du kan skapa egna privata ligor</li>
              <li>du kan bjuda in andra via ligakod</li>
              <li>samma sparade tips används i både huvudliga och kompisligor</li>
            </ul>
            <p>
              Viktigt: för att räknas i ligor måste deltagaren också ha betalat och
              vara med i huvudtävlingen.
            </p>

            <HelpImage
              src="/help/leagues.png"
              alt="Ligor och kompisligor i Addes VM-tips"
            />
          </HelpSection>

          <HelpSection step="6" title="Spara ditt tips">
            <p>
              När du har fyllt i dina matcher och valt dina lag i slutspelet måste
              du klicka på <strong>Spara tips</strong>.
            </p>
            <p>
              Det är det sparade tipset som gäller när deadline passerar. Om du gör
              ändringar men inte sparar finns risken att de inte räknas.
            </p>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Kom ihåg: när deadline passerat låses systemet automatiskt och inga
              fler ändringar kan göras.
            </div>
          </HelpSection>

          <HelpSection step="7" title="Betalning och status">
            <p>
              Alla kan skapa konto och bygga sitt tips, men det är bara betalande
              deltagare som räknas i tävlingen.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>du ser din unika kod på sidan</li>
              <li>Swish ska märkas med den koden</li>
              <li>obetalda deltagare får inte vara med i resultatlistorna</li>
              <li>efter deadline tas obetalda bort från poängräkningen</li>
            </ul>
          </HelpSection>

          <HelpSection step="8" title="Senaste nytt">
            <p>
              Under sektionen <strong>Senaste nytt</strong> publiceras viktiga
              uppdateringar om tävlingen.
            </p>
            <p>
              Där kan du läsa:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>information om spelet</li>
              <li>påminnelser inför deadline</li>
              <li>ändringar och nyheter</li>
              <li>annan viktig info från admin</li>
            </ul>
          </HelpSection>

          <HelpSection step="9" title="Vanliga frågor">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-bold text-slate-900">
                  Måste jag skicka in tipset via mail?
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Nej. I år sker allt direkt i appen. Det sparade tipset i systemet
                  är det som gäller.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-bold text-slate-900">
                  Vad gör knappen Adde Boy?
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Den fyller i hela gruppspelet automatiskt i sann Harry Boy-anda.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-bold text-slate-900">
                  Kan jag vara med i en kompisliga utan att betala?
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Nej. Alla i en kompisliga måste också delta i huvudligan och ha
                  betalat avgiften.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-bold text-slate-900">
                  Vad händer om jag glömmer att spara?
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Då finns risken att dina senaste ändringar inte räknas. Spara alltid
                  innan du lämnar sidan.
                </p>
              </div>
            </div>
          </HelpSection>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Klar att köra?
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
            Nu vet du hur appen fungerar. Gå tillbaka till startsidan, bygg ditt
            tips och kom ihåg att spara innan deadline.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Till startsidan
            </Link>

            <Link
              href="/rules"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Läs reglerna
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}