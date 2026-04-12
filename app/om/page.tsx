"use client";

type PlacementCard = {
  year: string;
  tournament: string;
  placement: string;
  name: string;
  image: string;
  imageClassName?: string;
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
    imageClassName: "object-top",
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
    imageClassName: "object-top",
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

export default function PlacementsSection() {
  return (
    <section className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-6">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/48">
          Tidigare pristagare
        </p>

        <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
          Riktiga vinnare. Riktiga priser. Riktig konkurrens.
        </h2>

        <p className="mt-4 text-base leading-7 text-white/78 md:text-lg md:leading-8">
          Addes VM-tips handlar inte bara om att tippa – det handlar om att vinna.
          Här är några pristagare från tidigare upplagor av VM- och EM-tipset.
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
                className={`h-[260px] w-full object-cover ${
                  item.imageClassName ?? "object-center"
                }`}
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
    </section>
  );
}