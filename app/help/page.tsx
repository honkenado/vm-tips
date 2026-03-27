import Image from "next/image";
import Link from "next/link";

type HelpCardProps = {
  title: string;
  text: string;
  imageSrc: string;
  imageAlt: string;
};

function HelpCard({ title, text, imageSrc, imageAlt }: HelpCardProps) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
        <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-[15px]">
          {text}
        </p>
      </div>

      <div className="p-3 sm:p-4 md:p-5">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1600}
            height={900}
            className="h-auto w-full object-contain"
            priority={imageSrc === "/help/header.png"}
          />
        </div>
      </div>
    </section>
  );
}

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_35%,_#f1f5f9_68%,_#e2e8f0_100%)] px-4 py-6 sm:px-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-gradient-to-r from-emerald-950 via-green-900 to-slate-950 p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.20)] sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/75">
            Addes VM-tips
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Hjälp</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200 sm:text-[15px]">
            Här ser du hur appen fungerar och hur du fyller i ditt tips.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
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

        <div className="grid gap-5 sm:gap-6">
          <HelpCard
            title="1. Översikt och navigation"
            text="I toppen av appen hittar du knappar för regler, hjälp, medlemmar, ligor och att spara ditt tips. Här ser du också appens header och huvudnavigering."
            imageSrc="/help/header.png"
            imageAlt="Header och navigation i Addes VM-tips"
          />

          <HelpCard
            title="2. Fyll i gruppspelet"
            text="Välj grupp och skriv in exakta matchresultat. Tabellerna uppdateras automatiskt efter varje resultat så att du direkt ser hur grupperna utvecklas."
            imageSrc="/help/groups.png"
            imageAlt="Gruppspel i Addes VM-tips"
          />

          <HelpCard
            title="3. Slutspelsträdet"
            text="När gruppspelet är ifyllt genereras slutspelet automatiskt. Där väljer du vinnare i varje match hela vägen fram till final och bronsmatch."
            imageSrc="/help/knockout.png"
            imageAlt="Slutspelsträd i Addes VM-tips"
          />

          <HelpCard
            title="4. Ligor och kompisligor"
            text="Du kan skapa en egen liga eller gå med i en befintlig via ligakod. På ligasidan ser du dina ligor och kan jämföra dig med andra deltagare."
            imageSrc="/help/leagues.png"
            imageAlt="Ligor i Addes VM-tips"
          />
        </div>
      </div>
    </main>
  );
}