import {
  buildNextRound,
  getKnockoutSeedData,
  getLoser,
} from "@/lib/tournament";
import type { GroupData, KnockoutMatch } from "@/types/tournament";

type RawMatch = {
  id?: string | number;
  homeTeam?: string;
  awayTeam?: string;
  homeGoals?: string | number | null;
  awayGoals?: string | number | null;
  homeScore?: string | number | null;
  awayScore?: string | number | null;
};

type RawGroup = {
  name?: string;
  groupName?: string;
  teams?: string[];
  matches?: RawMatch[];
};

type PrintablePrediction = {
  profileName: string;
  updatedAt: string | null;
  goldenBoot: string | null;
  groups: RawGroup[];
  knockout: Record<string, string>;
};

type TableRow = {
  team: string;
  played: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

function formatDate(dateString: string | null) {
  if (!dateString) return "Okänt";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getGroupName(group: RawGroup, index: number) {
  return group.name || group.groupName || `Grupp ${index + 1}`;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function shortenTeamName(team: string) {
  return team
    .replace("Europeiskt playoff", "EU playoff")
    .replace("FIFA playoff", "FIFA playoff")
    .trim();
}

function buildStandings(group: RawGroup): TableRow[] {
  const matches = group.matches ?? [];
  const teamNames = new Set<string>();

  if (Array.isArray(group.teams)) {
    group.teams.forEach((team) => {
      if (team) teamNames.add(team);
    });
  }

  matches.forEach((match) => {
    if (match.homeTeam) teamNames.add(match.homeTeam);
    if (match.awayTeam) teamNames.add(match.awayTeam);
  });

  const table = new Map<string, TableRow>();

  for (const team of teamNames) {
    table.set(team, {
      team,
      played: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    const homeTeam = match.homeTeam;
    const awayTeam = match.awayTeam;

    if (!homeTeam || !awayTeam) continue;

    const homeGoals = toNumber(match.homeGoals ?? match.homeScore);
    const awayGoals = toNumber(match.awayGoals ?? match.awayScore);

    if (homeGoals === null || awayGoals === null) continue;

    const home = table.get(homeTeam);
    const away = table.get(awayTeam);

    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;

    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;

    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      home.points += 3;
    } else if (homeGoals < awayGoals) {
      away.points += 3;
    } else {
      home.points += 1;
      away.points += 1;
    }
  }

  const rows = Array.from(table.values()).map((row) => ({
    ...row,
    goalDifference: row.goalsFor - row.goalsAgainst,
  }));

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.localeCompare(b.team, "sv");
  });

  return rows;
}

function GroupCompactCard({
  group,
  index,
}: {
  group: RawGroup;
  index: number;
}) {
  const standings = buildStandings(group);

  return (
    <div className="border border-slate-300 px-2 py-1.5">
      <h3 className="mb-1 text-[11px] font-extrabold leading-none text-slate-900">
        {getGroupName(group, index)}
      </h3>

      <div className="space-y-[1px] text-[8px] leading-tight">
        {(group.matches || []).map((match, matchIndex) => {
          const homeGoals = match.homeGoals ?? match.homeScore ?? "-";
          const awayGoals = match.awayGoals ?? match.awayScore ?? "-";

          return (
            <div
              key={match.id || matchIndex}
              className="grid grid-cols-[1fr_auto_1fr] gap-x-1"
            >
              <div className="truncate">{shortenTeamName(match.homeTeam || "Lag 1")}</div>
              <div className="font-bold">
                {homeGoals}-{awayGoals}
              </div>
              <div className="truncate text-right">
                {shortenTeamName(match.awayTeam || "Lag 2")}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-1 overflow-hidden border border-slate-200">
        <table className="min-w-full text-[7.5px] leading-tight">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-1 py-[1px] text-left font-bold">#</th>
              <th className="px-1 py-[1px] text-left font-bold">Lag</th>
              <th className="px-1 py-[1px] text-center font-bold">M</th>
              <th className="px-1 py-[1px] text-center font-bold">MS</th>
              <th className="px-1 py-[1px] text-center font-bold">P</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, standingIndex) => (
              <tr
                key={`${team.team}-${standingIndex}`}
                className="border-t border-slate-100"
              >
                <td className="px-1 py-0">{standingIndex + 1}</td>
                <td className="px-1 py-0 truncate">{shortenTeamName(team.team)}</td>
                <td className="px-1 py-0 text-center">{team.played}</td>
                <td className="px-1 py-0 text-center">{team.goalDifference}</td>
                <td className="px-1 py-0 text-center font-bold">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getMatchDisplayLabel(match: KnockoutMatch) {
  return match.label?.toUpperCase() || String(match.id).toUpperCase();
}

function MatchRow({
  team,
  selected,
}: {
  team: string;
  selected?: boolean;
}) {
  return (
    <div
      className={`rounded-md border px-2 py-1 text-center text-[8px] font-extrabold leading-tight ${
        selected
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-emerald-200 bg-slate-50 text-slate-900"
      }`}
    >
      {shortenTeamName(team || "-")}
    </div>
  );
}

function MatchBox({
  match,
  selectedWinner,
}: {
  match: KnockoutMatch;
  selectedWinner?: string;
}) {
  return (
    <div className="border border-emerald-300 bg-white px-2 py-1.5 shadow-sm">
      <div className="mb-1 text-[7px] font-bold uppercase leading-none text-slate-500">
        {getMatchDisplayLabel(match)}
      </div>

      <MatchRow team={match.home || "-"} selected={selectedWinner === match.home} />

      <div className="py-0.5 text-center text-[7px] font-bold uppercase text-slate-400">
        vs
      </div>

      <MatchRow team={match.away || "-"} selected={selectedWinner === match.away} />
    </div>
  );
}

function RoundSection({
  title,
  matches,
  knockout,
  columns = 4,
}: {
  title: string;
  matches: KnockoutMatch[];
  knockout: Record<string, string>;
  columns?: 2 | 3 | 4;
}) {
  const gridCols =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
      ? "grid-cols-3"
      : "grid-cols-4";

  return (
    <div className="border border-slate-300 px-3 py-2">
      <h3 className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-700">
        {title}
      </h3>

      <div className={`grid ${gridCols} gap-2`}>
        {matches.map((match) => (
          <MatchBox
            key={match.id}
            match={match}
            selectedWinner={knockout[match.id]}
          />
        ))}
      </div>
    </div>
  );
}

function MedalCard({
  title,
  team,
  className,
}: {
  title: string;
  team: string;
  className: string;
}) {
  return (
    <div className={`min-w-[110px] border px-3 py-2 text-center ${className}`}>
      <div className="text-[7px] font-bold uppercase tracking-[0.18em]">
        {title}
      </div>
      <div className="text-[11px] font-extrabold">
        {shortenTeamName(team || "-")}
      </div>
    </div>
  );
}

export default function PredictionPrintDocument({
  profileName,
  updatedAt,
  goldenBoot,
  groups,
  knockout,
}: PrintablePrediction) {
  const typedGroups = groups as GroupData[];

  const { round32 } = getKnockoutSeedData(typedGroups);
  const r16 = buildNextRound(round32, knockout, "r16", "Åttondelsfinal");
  const qf = buildNextRound(r16, knockout, "qf", "Kvartsfinal");
  const sf = buildNextRound(qf, knockout, "sf", "Semifinal");
  const finalMatches = buildNextRound(sf, knockout, "final", "Final");

  const bronze: KnockoutMatch[] = [
    {
      id: "bronze-1",
      label: "Bronsmatch",
      home: sf[0] ? getLoser(sf[0], knockout) : "",
      away: sf[1] ? getLoser(sf[1], knockout) : "",
    },
  ];

  const gold = knockout[finalMatches[0]?.id] || "";
  const silver =
    finalMatches[0] && gold
      ? [finalMatches[0].home, finalMatches[0].away].find((team) => team !== gold) || ""
      : "";
  const bronzeWinner = knockout["bronze-1"] || "";

  return (
    <div className="mx-auto max-w-none bg-white text-slate-900 print:text-[8px]">
      <section>
        <header className="mb-2 border border-slate-300 px-3 py-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Addes VM-tips
              </p>
              <h1 className="text-sm font-extrabold leading-tight">
                Ditt sparade tips
              </h1>
            </div>

            <div className="grid gap-[1px] text-[8px] leading-tight">
              <div>
                <span className="font-bold">Namn:</span> {profileName}
              </div>
              <div>
                <span className="font-bold">Senast sparat:</span>{" "}
                {formatDate(updatedAt)}
              </div>
              <div>
                <span className="font-bold">Skyttekung:</span>{" "}
                {goldenBoot || "Ej ifyllt"}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-3">
          {groups.map((group, index) => (
            <GroupCompactCard
              key={`${getGroupName(group, index)}-${index}`}
              group={group}
              index={index}
            />
          ))}
        </div>
      </section>

      <section className="print-page-break">
        <div className="mb-4 flex items-center justify-center gap-4">
          <MedalCard
            title="Guld"
            team={gold}
            className="border-yellow-400 bg-yellow-50 text-yellow-900"
          />
          <MedalCard
            title="Silver"
            team={silver}
            className="border-slate-400 bg-slate-100 text-slate-900"
          />
          <MedalCard
            title="Brons"
            team={bronzeWinner}
            className="border-orange-400 bg-orange-50 text-orange-900"
          />
        </div>

        <div className="space-y-3">
          <RoundSection
            title="Sextondelsfinal"
            matches={round32}
            knockout={knockout}
            columns={4}
          />

          <RoundSection
            title="Åttondelsfinal"
            matches={r16}
            knockout={knockout}
            columns={4}
          />

          <RoundSection
            title="Kvartsfinal"
            matches={qf}
            knockout={knockout}
            columns={4}
          />

          <RoundSection
            title="Semifinal"
            matches={sf}
            knockout={knockout}
            columns={2}
          />

          <RoundSection
            title="Final och bronsmatch"
            matches={[...finalMatches, ...bronze]}
            knockout={knockout}
            columns={2}
          />
        </div>

        <footer className="mt-4 border-t border-slate-300 pt-1 text-[8px] text-slate-500">
          Exporterad från Addes VM-tips • {formatDate(updatedAt)}
        </footer>
      </section>
    </div>
  );
}