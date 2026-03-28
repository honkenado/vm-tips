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
    dateStyle: "medium",
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
    key.includes("sextondel")
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

function prettifyMatchKey(matchKey: string) {
  return matchKey
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

  return (
    <div className="mx-auto max-w-6xl bg-white text-slate-900">
      <header className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Addes VM-tips
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Ditt sparade tips
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Ren utskriftsvy för att skriva ut eller spara som PDF.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <div>
              <span className="font-semibold">Namn:</span> {profileName}
            </div>
            <div className="mt-1">
              <span className="font-semibold">Senast sparat:</span>{" "}
              {formatDate(updatedAt)}
            </div>
            <div className="mt-1">
              <span className="font-semibold">Skyttekung:</span>{" "}
              {goldenBoot || "Ej ifyllt"}
            </div>
          </div>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">
          Gruppspel och slutställningar
        </h2>

        <div className="space-y-8">
          {groups.map((group, groupIndex) => {
            const standings = buildStandings(group);

            return (
              <div
                key={`${getGroupName(group, groupIndex)}-${groupIndex}`}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">
                    {getGroupName(group, groupIndex)}
                  </h3>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                      Matchresultat
                    </h4>

                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <table className="min-w-full text-sm">
                        <tbody className="divide-y divide-slate-200">
                          {(group.matches || []).map((match, matchIndex) => {
                            const homeGoals = match.homeGoals ?? match.homeScore;
                            const awayGoals = match.awayGoals ?? match.awayScore;

                            return (
                              <tr key={match.id || matchIndex} className="bg-white">
                                <td className="px-4 py-3 font-medium text-slate-800">
                                  {match.homeTeam || "Lag 1"}
                                </td>
                                <td className="w-[90px] px-2 py-3 text-center font-bold text-slate-900">
                                  {homeGoals ?? "-"} - {awayGoals ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-slate-800">
                                  {match.awayTeam || "Lag 2"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                      Slutställning
                    </h4>

                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">#</th>
                            <th className="px-4 py-3 text-left font-semibold">Lag</th>
                            <th className="px-4 py-3 text-center font-semibold">M</th>
                            <th className="px-4 py-3 text-center font-semibold">MS</th>
                            <th className="px-4 py-3 text-center font-semibold">P</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {standings.map((team, index) => (
                            <tr key={`${team.team}-${index}`}>
                              <td className="px-4 py-3 font-semibold">{index + 1}</td>
                              <td className="px-4 py-3 font-medium">{team.team}</td>
                              <td className="px-4 py-3 text-center">{team.played}</td>
                              <td className="px-4 py-3 text-center">
                                {team.goalDifference}
                              </td>
                              <td className="px-4 py-3 text-center font-bold">
                                {team.points}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      M = matcher, MS = målskillnad, P = poäng
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">Slutspelstips</h2>

        {orderedKnockoutRounds.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Inga slutspelsval hittades.
          </div>
        ) : (
          <div className="space-y-6">
            {orderedKnockoutRounds.map(([round, matches]) => (
              <div
                key={round}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="mb-4 text-xl font-bold">{round}</h3>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {matches.map((match) => (
                    <div
                      key={match.key}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {prettifyMatchKey(match.key)}
                      </div>
                      <div className="mt-2 text-base font-bold text-slate-900">
                        {match.winner}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-slate-200 pt-6 text-xs text-slate-500">
        Exporterad från Addes VM-tips • {formatDate(updatedAt)}
      </footer>
    </div>
  );
}