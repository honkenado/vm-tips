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

function shortGroupName(group: RawGroup, index: number) {
  const full = getGroupName(group, index);
  return full.replace("Grupp ", "Grupp ");
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
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

function getRoundLabel(matchKey: string) {
  const key = matchKey.toLowerCase();

  if (
    key.includes("round32") ||
    key.includes("r32") ||
    key.includes("last32") ||
    key.includes("sextondel") ||
    /^m7\d|^m8\d/.test(key)
  ) {
    return "Sextondelsfinal";
  }

  if (
    key.includes("round16") ||
    key.includes("r16") ||
    key.includes("last16") ||
    key.includes("attondel")
  ) {
    return "Åttondelsfinal";
  }

  if (key.includes("quarter") || key.includes("kvart") || key.includes("qf")) {
    return "Kvartsfinal";
  }

  if (key.includes("semi") || key.includes("sf")) {
    return "Semifinal";
  }

  if (key.includes("bronze") || key.includes("brons")) {
    return "Bronsmatch";
  }

  if (key.includes("final")) {
    return "Final";
  }

  return "Övrigt";
}

function roundSortOrder(round: string) {
  switch (round) {
    case "Sextondelsfinal":
      return 1;
    case "Åttondelsfinal":
      return 2;
    case "Kvartsfinal":
      return 3;
    case "Semifinal":
      return 4;
    case "Bronsmatch":
      return 5;
    case "Final":
      return 6;
    default:
      return 99;
  }
}

function compactMatchKey(matchKey: string) {
  return matchKey
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function shortenTeamName(team: string) {
  return team
    .replace("Europeiskt playoff", "EU playoff")
    .replace("FIFA playoff", "FIFA playoff")
    .trim();
}

export default function PredictionPrintDocument({
  profileName,
  updatedAt,
  goldenBoot,
  groups,
  knockout,
}: PrintablePrediction) {
  const groupedKnockout = Object.entries(knockout || {}).reduce<
    Record<string, Array<{ key: string; winner: string }>>
  >((acc, [key, winner]) => {
    const round = getRoundLabel(key);
    if (!acc[round]) acc[round] = [];
    acc[round].push({ key, winner });
    return acc;
  }, {});

  const orderedKnockoutRounds = Object.entries(groupedKnockout).sort(
    ([roundA], [roundB]) => roundSortOrder(roundA) - roundSortOrder(roundB)
  );

  const firstPageGroups = groups.slice(0, 6);
  const secondPageGroups = groups.slice(6, 12);

  return (
    <div className="mx-auto max-w-none bg-white text-slate-900 print:text-[10px]">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          html,
          body {
            background: white !important;
          }

          .print-page-break {
            break-before: page;
            page-break-before: always;
          }

          .print-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <section className="print-avoid-break">
        <header className="mb-3 rounded-xl border border-slate-300 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Addes VM-tips
              </p>
              <h1 className="text-2xl font-extrabold leading-tight">
                Ditt sparade tips
              </h1>
            </div>

            <div className="grid min-w-[260px] gap-1 text-xs">
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

        <h2 className="mb-2 text-lg font-extrabold">Gruppspel och slutställning</h2>

        <div className="grid grid-cols-2 gap-3">
          {firstPageGroups.map((group, groupIndex) => {
            const standings = buildStandings(group);

            return (
              <div
                key={`${getGroupName(group, groupIndex)}-${groupIndex}`}
                className="print-avoid-break rounded-xl border border-slate-300 px-3 py-2"
              >
                <h3 className="mb-2 text-sm font-extrabold">
                  {shortGroupName(group, groupIndex)}
                </h3>

                <div className="grid grid-cols-[1.3fr_0.5fr_1.3fr] gap-x-2 gap-y-1 text-[10px] leading-tight">
                  {(group.matches || []).map((match, matchIndex) => {
                    const homeGoals = match.homeGoals ?? match.homeScore;
                    const awayGoals = match.awayGoals ?? match.awayScore;

                    return (
                      <div
                        key={match.id || matchIndex}
                        className="contents"
                      >
                        <div className="truncate">{shortenTeamName(match.homeTeam || "Lag 1")}</div>
                        <div className="text-center font-bold">
                          {homeGoals ?? "-"}-{awayGoals ?? "-"}
                        </div>
                        <div className="truncate text-right">
                          {shortenTeamName(match.awayTeam || "Lag 2")}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
                  <table className="min-w-full text-[10px] leading-tight">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-2 py-1 text-left font-bold">#</th>
                        <th className="px-2 py-1 text-left font-bold">Lag</th>
                        <th className="px-2 py-1 text-center font-bold">M</th>
                        <th className="px-2 py-1 text-center font-bold">MS</th>
                        <th className="px-2 py-1 text-center font-bold">P</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, index) => (
                        <tr key={`${team.team}-${index}`} className="border-t border-slate-100">
                          <td className="px-2 py-0.5">{index + 1}</td>
                          <td className="px-2 py-0.5 truncate">
                            {shortenTeamName(team.team)}
                          </td>
                          <td className="px-2 py-0.5 text-center">{team.played}</td>
                          <td className="px-2 py-0.5 text-center">{team.goalDifference}</td>
                          <td className="px-2 py-0.5 text-center font-bold">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="print-page-break">
        <h2 className="mb-2 text-lg font-extrabold">Gruppspel och slutställning forts.</h2>

        <div className="mb-4 grid grid-cols-2 gap-3">
          {secondPageGroups.map((group, localIndex) => {
            const groupIndex = localIndex + 6;
            const standings = buildStandings(group);

            return (
              <div
                key={`${getGroupName(group, groupIndex)}-${groupIndex}`}
                className="print-avoid-break rounded-xl border border-slate-300 px-3 py-2"
              >
                <h3 className="mb-2 text-sm font-extrabold">
                  {shortGroupName(group, groupIndex)}
                </h3>

                <div className="grid grid-cols-[1.3fr_0.5fr_1.3fr] gap-x-2 gap-y-1 text-[10px] leading-tight">
                  {(group.matches || []).map((match, matchIndex) => {
                    const homeGoals = match.homeGoals ?? match.homeScore;
                    const awayGoals = match.awayGoals ?? match.awayScore;

                    return (
                      <div
                        key={match.id || matchIndex}
                        className="contents"
                      >
                        <div className="truncate">{shortenTeamName(match.homeTeam || "Lag 1")}</div>
                        <div className="text-center font-bold">
                          {homeGoals ?? "-"}-{awayGoals ?? "-"}
                        </div>
                        <div className="truncate text-right">
                          {shortenTeamName(match.awayTeam || "Lag 2")}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
                  <table className="min-w-full text-[10px] leading-tight">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-2 py-1 text-left font-bold">#</th>
                        <th className="px-2 py-1 text-left font-bold">Lag</th>
                        <th className="px-2 py-1 text-center font-bold">M</th>
                        <th className="px-2 py-1 text-center font-bold">MS</th>
                        <th className="px-2 py-1 text-center font-bold">P</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, index) => (
                        <tr key={`${team.team}-${index}`} className="border-t border-slate-100">
                          <td className="px-2 py-0.5">{index + 1}</td>
                          <td className="px-2 py-0.5 truncate">
                            {shortenTeamName(team.team)}
                          </td>
                          <td className="px-2 py-0.5 text-center">{team.played}</td>
                          <td className="px-2 py-0.5 text-center">{team.goalDifference}</td>
                          <td className="px-2 py-0.5 text-center font-bold">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        <section className="print-avoid-break">
          <h2 className="mb-2 text-lg font-extrabold">Slutspelstips</h2>

          {orderedKnockoutRounds.length === 0 ? (
            <div className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600">
              Inga slutspelsval hittades.
            </div>
          ) : (
            <div className="space-y-2">
              {orderedKnockoutRounds.map(([round, matches]) => (
                <div
                  key={round}
                  className="rounded-xl border border-slate-300 px-3 py-2"
                >
                  <h3 className="mb-1 text-sm font-extrabold">{round}</h3>

                  <div className="grid grid-cols-4 gap-x-3 gap-y-1 text-[10px] leading-tight">
                    {matches.map((match) => (
                      <div key={match.key} className="flex gap-1">
                        <span className="font-bold text-slate-500">
                          {compactMatchKey(match.key)}:
                        </span>
                        <span className="truncate font-semibold">
                          {shortenTeamName(match.winner)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-3 border-t border-slate-300 pt-2 text-[10px] text-slate-500">
          Exporterad från Addes VM-tips • {formatDate(updatedAt)}
        </footer>
      </section>
    </div>
  );
}