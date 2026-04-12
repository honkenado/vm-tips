import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Om mig | Addes VM-tips",
  description: "Läs mer om Henrik och tidigare pristagare i Addes VM-tips.",
};

type PlacementCard = {
  year: string;
  tournament: string;
  placement: string;
  name: string;
  image: string;
};

const placements: PlacementCard[] = [
  {
    year: "2024",
    tournament: "EM 2024",
    placement: "Vinnare 2024",
    name: "Gustav Nordlund",
    image: "/images/om/vinnare-2024.jpeg",
  },
  {
    year: "2024",
    tournament: "EM 2024",
    placement: "Tvåa 2024",
    name: "Marcus Nilsson",
    image: "/images/om/tvaa-2024.jpeg",
  },
  {
    year: "2024",
    tournament: "EM 2024",
    placement: "Trea 2024",
    name: "Alexander Hellgren Bedinger",
    image: "/images/om/trea-2024.jpeg",
  },
  {
    year: "2024",
    tournament: "EM 2024",
    placement: "Fyra 2024",
    name: "Albin Skoglund",
    image: "/images/om/fyra-2024.jpeg",
  },
  {
    year: "2022",
    tournament: "VM 2022",
    placement: "Vinnare 2022",
    name: "Kent Bäcklund",
    image: "/images/om/vinnare-2022.jpeg",
  },
  {
    year: "2022",
    tournament: "VM 2022",
    placement: "Tvåa 2022",
    name: "Jonas Edin",
    image: "/images/om/tvaa-2022.jpeg",
  },
  {
    year: "2022",
    tournament: "VM 2022",
    placement: "Trea 2022",
    name: "Tuve Brandén",
    image: "/images/om/trea-2022.jpeg",
  },
  {
    year: "2022",
    tournament: "VM 2022",
    placement: "Fyra 2022",
    name: "Magnus Adolfsson",
    image: "/images/om/fyra-2022.jpeg",
  },
  {
    year: "2018",
    tournament: "VM 2018",
    placement: "Vinnare 2018",
    name: "Mohammed Khayatbashi",
    image: "/images/om/vinnare-2018.jpeg",
  },
  {
    year: "2018",
    tournament: "VM 2018",
    placement: "Tvåa 2018",
    name: "Nicklas Wingsund",
    image: "/images/om/tvaa-2018.jpeg",
  },
  {
    year: "2018",
    tournament: "VM 2018",
    placement: "Trea 2018",
    name: "Samuel Ryhn",
    image: "/images/om/trea-2018.jpeg",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#020617] pb-24 md:pb-0">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 md:px-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/6 bg-[#020617] text-white shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
          <div className="pointer-events-none absolute -left-28 -top-24 h-[420px] w-[420px] rounded-full bg-emerald-500/14 blur-[140px]" />
          <div className="pointer-events-none absolute left-[18%] top-[58%] h-[280px] w-[280px] rounded-full bg-emerald-400/6 blur-[120px]" />
          <div className="pointer-events-none absolute -right-24 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-emerald-300/8 blur-[120px]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02),transparent_35%,transparent_65%,rgba(16,185,129,0.03))]" />

          <div className="relative p-4 md:p-6 xl:p-8">
            <div className="mb-4">
              <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur-xl">
                Om Addes VM-tips
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-6">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                <div className="overflow-hidden rounded-[1.25rem] border border-white/10">
                  <img
                    src="/images/om/henrik.jpeg"
                    alt="Henrik på fotbollsplan"
                    className="h-[420px] w-full object-cover object-center sm:h-[520px] lg:h-[620px]"
                  />
                </div>

                <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-sm leading-6 text-white/78">
                    Skaparen bakom Addes VM-tips. Ett tips byggt för att vara
                    roligare, tydligare och mer engagerande hela vägen till finalen.
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-6">
                <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                  Om mig
                </h1>

                <p className="mt-4 text-lg leading-8 text-white/90">
                  Jag heter Henrik och det är jag som står bakom Addes VM-tips.
                </p>

                <div className="mt-5 space-y-5 text-base leading-8 text-white/78 md:text-lg">
                  <p>
                    Projektet började som en ganska enkel idé: att skapa ett tips
                    som faktiskt är roligt att använda. Jag har själv deltagit i
                    många olika tips genom åren, och ofta har det saknats något –
                    antingen känns det för statiskt, för krångligt, eller så tappar
                    man intresset halvvägs in i turneringen.
                  </p>

                  <p>
                    Därför bestämde jag mig för att bygga en egen lösning.
                  </p>

                  <p>
                    Målet har varit att skapa en sida som är tydlig, engagerande
                    och som gör att man vill följa sina tips hela vägen – från
                    första matchen till finalen. Ett tips där varje val känns
                    relevant och där det finns något att spela för hela tiden.
                  </p>

                  <p>
                    Samtidigt är det viktigt att det ska vara enkelt att vara med.
                    Du behöver inte vara expert för att delta, men det ska ändå
                    finnas tillräckligt djup för att kunskap, känsla och analys ska
                    göra skillnad.
                  </p>

                  <p>
                    Addes VM-tips är också tänkt att vara en social upplevelse.
                    Oavsett om du spelar med kompisar, kollegor eller familj är
                    tanken att skapa lite extra nerv, diskussion och konkurrens
                    under mästerskapet.
                  </p>

                  <p>
                    Bakom kulisserna är sidan något jag fortsätter att utveckla och
                    förbättra löpande, både utifrån egna idéer och feedback från
                    användare.
                  </p>

                  <p>
                    Har du synpunkter, idéer eller vill vara med och tävla är du
                    varmt välkommen.
                  </p>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/tips"
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-500/95 px-8 py-4 text-lg font-bold text-white shadow-[0_12px_30px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400 md:py-3.5 md:text-base"
                  >
                    Gå till tipset
                  </Link>

                  <Link
                    href="/league"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-8 py-4 text-lg font-bold text-white transition hover:bg-white/[0.1] md:py-3.5 md:text-base"
                  >
                    Se ligor
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-6">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/48">
                  Tidigare pristagare
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                  Riktiga vinnare. Riktiga priser. Riktig konkurrens.
                </h2>

                <p className="mt-4 text-base leading-7 text-white/78 md:text-lg md:leading-8">
                  Addes VM-tips handlar inte bara om att tippa – det handlar om
                  att vinna. Här är några pristagare från tidigare upplagor av
                  VM- och EM-tipset.
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {placements.map((item) => (
                  <article
                    key={`${item.year}-${item.placement}`}
                    className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl"
                  >
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.placement}
                        className="h-[260px] w-full object-cover"
                      />
                      <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-[#020617]/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-xl">
                        {item.year}
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/48">
                        {item.tournament}
                      </p>

                      <h3 className="mt-2 text-xl font-black text-white">
                        {item.placement}
                      </h3>

                      <p className="mt-1 text-sm text-emerald-300">
                        {item.name}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-6">
                <h3 className="text-2xl font-black text-white">
                  Vill du stå här nästa gång?
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/72 md:text-base">
                  Gå med i tipset, utmana andra och följ ditt resultat hela vägen
                  genom turneringen.
                </p>

                <div className="mt-5">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-500/95 px-8 py-4 text-lg font-bold text-white shadow-[0_12px_30px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400 md:py-3.5 md:text-base"
                  >
                    Gå med i tipset
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}