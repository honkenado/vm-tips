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

function getMatchNumber(matchId: string) {
  const match = matchId.match(/(\d+)/);
  if (!match) return matchId.toUpperCase();
  return `MATCH ${match[1]}`;
}

function MatchCard({
  match,
  selectedWinner,
  compact = false,
}: {
  match: KnockoutMatch;
  selectedWinner?: string;
  compact?: boolean;
}) {
  const homeSelected = selectedWinner && selectedWinner === match.home;
  const awaySelected = selectedWinner && selectedWinner === match.away;

  return (
    <div
      className={`border border-emerald-300 bg-white px-2 py-1.5 shadow-sm ${
        compact ? "w-[150px]" : "w-[170px]"
      }`}
    >
      <div className="mb-1 text-[8px] font-bold uppercase leading-none text-slate-500">
        {getMatchNumber(match.id)}
      </div>

      <div
        className={`rounded-md border px-2 py-1 text-center text-[8px] font-extrabold leading-tight ${
          homeSelected
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-emerald-200 bg-slate-50 text-slate-900"
        }`}
      >
        {shortenTeamName(match.home || "-")}
      </div>

      <div className="py-0.5 text-center text-[8px] font-bold uppercase text-slate-400">
        vs
      </div>

      <div
        className={`rounded-md border px-2 py-1 text-center text-[8px] font-extrabold leading-tight ${
          awaySelected
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-emerald-200 bg-slate-50 text-slate-900"
        }`}
      >
        {shortenTeamName(match.away || "-")}
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

  const leftRound32 = round32.slice(0, 8);
  const rightRound32 = round32.slice(8, 16);
  const leftR16 = r16.slice(0, 4);
  const rightR16 = r16.slice(4, 8);
  const leftQF = qf.slice(0, 2);
  const rightQF = qf.slice(2, 4);
  const leftSF = sf.slice(0, 1);
  const rightSF = sf.slice(1, 2);

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

        <div className="grid grid-cols-4 gap-2">
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
          <div className="min-w-[120px] border border-yellow-400 bg-yellow-50 px-3 py-2 text-center">
            <div className="text-[7px] font-bold uppercase tracking-[0.18em] text-yellow-700">
              Guld
            </div>
            <div className="text-[11px] font-extrabold">
              {shortenTeamName(gold || "-")}
            </div>
          </div>

          <div className="min-w-[120px] border border-slate-400 bg-slate-100 px-3 py-2 text-center">
            <div className="text-[7px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Silver
            </div>
            <div className="text-[11px] font-extrabold">
              {shortenTeamName(silver || "-")}
            </div>
          </div>

          <div className="min-w-[120px] border border-orange-400 bg-orange-50 px-3 py-2 text-center">
            <div className="text-[7px] font-bold uppercase tracking-[0.18em] text-orange-700">
              Brons
            </div>
            <div className="text-[11px] font-extrabold">
              {shortenTeamName(bronzeWinner || "-")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[170px_170px_170px_170px_190px_170px_170px_170px_170px] gap-4 overflow-hidden">
          <div>
            <div className="mb-2 text-center text-[9px] font-extrabold uppercase tracking-wide text-slate-700">
              R32
            </div>
            <div className="space-y-2">
              {leftRound32.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  selectedWinner={knockout[match.id]}
                  compact
                />
              ))}
            </div>
          </div>

          <div className="pt-11">
            <div className="mb-2 text-center text-[9px] font-extrabold uppercase tracking-wide text-slate-700">
              R16
            </div>
            <div className="space-y-8">
              {leftR16.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  selectedWinner={knockout[match.id]}
                />
              ))}
            </div>
          </div>

          <div className="pt-24">
            <div className="mb-2 text-center text-[9px] font-extrabold uppercase tracking-wide text-slate-700">
              Kvartsfinal
            </div>
            <div className="space-y-16">
              {leftQF.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  selectedWinner={knockout[match.id]}
                />
              ))}
            </div>
          </div>

          <div className="pt-40">
            <div className="mb-2 text-center text-[9px] font-extrabold uppercase tracking-wide text-slate-700">
              Semifinal
            </div>
            <div className="space-y-24">
              {leftSF.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  selectedWinner={knockout[match.id]}
                />
              ))}
            </div>
          </div>

          <div className="pt-32">
            <div className="mb-2 text-center text-[9px] font-extrabold uppercase tracking-wide text-slate-700">
              Final / Brons
            </div>

            <div className="space-y-10">
              {finalMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  selectedWinner={knockout[match.id]}
                />
              ))}

              {bronze.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  selectedWinner={knockout[match.id]}
                />
              ))}
            </div>
          </div>

          <div className="pt-40">
            <div className="mb-2 text-center text-[9px] font-extrabold uppercase tracking-wide text-slate-700">
              Semifinal
            </div>
            <div className="space-y-24">
              {rightSF.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  selectedWinner={knockout[match.id]}
                />
              ))}
            </div>
          </div>

          <div className="pt-24">
            <div className="mb-2 text-center text-[9px] font-extrabold uppercase tracking-wide text-slate-700">
              Kvartsfinal
            </div>
            <div className="space-y-16">
              {rightQF.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  selectedWinner={knockout[match.id]}
                />
              ))}
            </div>
          </div>

          <div className="pt-11">
            <div className="mb-2 text-center text-[9px] font-extrabold uppercase tracking-wide text-slate-700">
              R16
            </div>
            <div className="space-y-8">
              {rightR16.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  selectedWinner={knockout[match.id]}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-center text-[9px] font-extrabold uppercase tracking-wide text-slate-700">
              R32
            </div>
            <div className="space-y-2">
              {rightRound32.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  selectedWinner={knockout[match.id]}
                  compact
                />
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-4 border-t border-slate-300 pt-1 text-[8px] text-slate-500">
          Exporterad från Addes VM-tips • {formatDate(updatedAt)}
        </footer>
      </section>
    </div>
  );
}