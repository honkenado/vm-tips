import type {
  GroupData,
  KnockoutMatch,
  Match,
  TableRow,
  ThirdPlaceRow,
} from "@/types/tournament";
import { getThirdPlaceMapping } from "@/lib/thirdPlaceLookup";

type ScheduledMatch = {
  matchNumber: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
};

function createScheduledGroup(
  name: string,
  teams: string[],
  schedule: ScheduledMatch[]
): GroupData {
  return {
    name,
    teams,
    matches: schedule.map((match) => ({
      id: match.matchNumber,
      matchNumber: match.matchNumber,
      date: match.date,
      time: match.time,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeGoals: "",
      awayGoals: "",
    })),
  };
}

export const initialGroups: GroupData[] = [
  createScheduledGroup(
    "Grupp A",
    ["Mexiko", "Sydafrika", "Sydkorea", "Europeiskt playoff D"],
    [
      {
        matchNumber: 1,
        date: "11 juni 2026",
        time: "21:00",
        homeTeam: "Mexiko",
        awayTeam: "Sydafrika",
      },
      {
        matchNumber: 2,
        date: "12 juni 2026",
        time: "04:00",
        homeTeam: "Sydkorea",
        awayTeam: "Europeiskt playoff D",
      },
      {
        matchNumber: 25,
        date: "18 juni 2026",
        time: "18:00",
        homeTeam: "Europeiskt playoff D",
        awayTeam: "Sydafrika",
      },
      {
        matchNumber: 28,
        date: "19 juni 2026",
        time: "03:00",
        homeTeam: "Mexiko",
        awayTeam: "Sydkorea",
      },
      {
        matchNumber: 53,
        date: "25 juni 2026",
        time: "03:00",
        homeTeam: "Sydafrika",
        awayTeam: "Sydkorea",
      },
      {
        matchNumber: 54,
        date: "25 juni 2026",
        time: "03:00",
        homeTeam: "Europeiskt playoff D",
        awayTeam: "Mexiko",
      },
    ]
  ),

  createScheduledGroup(
    "Grupp B",
    ["Kanada", "Europeiskt playoff A", "Qatar", "Schweiz"],
    [
      {
        matchNumber: 3,
        date: "12 juni 2026",
        time: "21:00",
        homeTeam: "Kanada",
        awayTeam: "Europeiskt playoff A",
      },
      {
        matchNumber: 8,
        date: "13 juni 2026",
        time: "21:00",
        homeTeam: "Qatar",
        awayTeam: "Schweiz",
      },
      {
        matchNumber: 26,
        date: "18 juni 2026",
        time: "21:00",
        homeTeam: "Schweiz",
        awayTeam: "Europeiskt playoff A",
      },
      {
        matchNumber: 27,
        date: "19 juni 2026",
        time: "00:00",
        homeTeam: "Kanada",
        awayTeam: "Qatar",
      },
      {
        matchNumber: 51,
        date: "24 juni 2026",
        time: "21:00",
        homeTeam: "Schweiz",
        awayTeam: "Kanada",
      },
      {
        matchNumber: 52,
        date: "24 juni 2026",
        time: "21:00",
        homeTeam: "Europeiskt playoff A",
        awayTeam: "Qatar",
      },
    ]
  ),

  createScheduledGroup(
    "Grupp C",
    ["Brasilien", "Marocko", "Haiti", "Skottland"],
    [
      {
        matchNumber: 7,
        date: "14 juni 2026",
        time: "00:00",
        homeTeam: "Brasilien",
        awayTeam: "Marocko",
      },
      {
        matchNumber: 5,
        date: "14 juni 2026",
        time: "03:00",
        homeTeam: "Haiti",
        awayTeam: "Skottland",
      },
      {
        matchNumber: 30,
        date: "20 juni 2026",
        time: "00:00",
        homeTeam: "Skottland",
        awayTeam: "Marocko",
      },
      {
        matchNumber: 29,
        date: "20 juni 2026",
        time: "03:00",
        homeTeam: "Brasilien",
        awayTeam: "Haiti",
      },
      {
        matchNumber: 49,
        date: "25 juni 2026",
        time: "00:00",
        homeTeam: "Skottland",
        awayTeam: "Brasilien",
      },
      {
        matchNumber: 50,
        date: "25 juni 2026",
        time: "00:00",
        homeTeam: "Marocko",
        awayTeam: "Haiti",
      },
    ]
  ),

  createScheduledGroup(
    "Grupp D",
    ["USA", "Paraguay", "Australien", "Europeiskt playoff C"],
    [
      {
        matchNumber: 4,
        date: "13 juni 2026",
        time: "03:00",
        homeTeam: "USA",
        awayTeam: "Paraguay",
      },
      {
        matchNumber: 6,
        date: "14 juni 2026",
        time: "06:00",
        homeTeam: "Australien",
        awayTeam: "Europeiskt playoff C",
      },
      {
        matchNumber: 32,
        date: "19 juni 2026",
        time: "21:00",
        homeTeam: "USA",
        awayTeam: "Australien",
      },
      {
        matchNumber: 31,
        date: "20 juni 2026",
        time: "06:00",
        homeTeam: "Europeiskt playoff C",
        awayTeam: "Paraguay",
      },
      {
        matchNumber: 59,
        date: "26 juni 2026",
        time: "04:00",
        homeTeam: "Europeiskt playoff C",
        awayTeam: "USA",
      },
      {
        matchNumber: 60,
        date: "26 juni 2026",
        time: "04:00",
        homeTeam: "Paraguay",
        awayTeam: "Australien",
      },
    ]
  ),

  createScheduledGroup(
    "Grupp E",
    ["Tyskland", "Curaçao", "Elfenbenskusten", "Ecuador"],
    [
      {
        matchNumber: 10,
        date: "14 juni 2026",
        time: "19:00",
        homeTeam: "Tyskland",
        awayTeam: "Curaçao",
      },
      {
        matchNumber: 9,
        date: "15 juni 2026",
        time: "01:00",
        homeTeam: "Elfenbenskusten",
        awayTeam: "Ecuador",
      },
      {
        matchNumber: 33,
        date: "20 juni 2026",
        time: "22:00",
        homeTeam: "Tyskland",
        awayTeam: "Elfenbenskusten",
      },
      {
        matchNumber: 34,
        date: "21 juni 2026",
        time: "02:00",
        homeTeam: "Ecuador",
        awayTeam: "Curaçao",
      },
      {
        matchNumber: 55,
        date: "25 juni 2026",
        time: "22:00",
        homeTeam: "Curaçao",
        awayTeam: "Elfenbenskusten",
      },
      {
        matchNumber: 56,
        date: "25 juni 2026",
        time: "22:00",
        homeTeam: "Ecuador",
        awayTeam: "Tyskland",
      },
    ]
  ),

  createScheduledGroup(
    "Grupp F",
    ["Nederländerna", "Japan", "Europeiskt playoff B", "Tunisien"],
    [
      {
        matchNumber: 11,
        date: "14 juni 2026",
        time: "22:00",
        homeTeam: "Nederländerna",
        awayTeam: "Japan",
      },
      {
        matchNumber: 12,
        date: "15 juni 2026",
        time: "03:00",
        homeTeam: "Europeiskt playoff B",
        awayTeam: "Tunisien",
      },
      {
        matchNumber: 35,
        date: "20 juni 2026",
        time: "19:00",
        homeTeam: "Nederländerna",
        awayTeam: "Europeiskt playoff B",
      },
      {
        matchNumber: 36,
        date: "21 juni 2026",
        time: "06:00",
        homeTeam: "Tunisien",
        awayTeam: "Japan",
      },
      {
        matchNumber: 57,
        date: "26 juni 2026",
        time: "00:00",
        homeTeam: "Japan",
        awayTeam: "Europeiskt playoff B",
      },
      {
        matchNumber: 58,
        date: "26 juni 2026",
        time: "00:00",
        homeTeam: "Tunisien",
        awayTeam: "Nederländerna",
      },
    ]
  ),

  createScheduledGroup(
    "Grupp G",
    ["Belgien", "Egypten", "Iran", "Nya Zeeland"],
    [
      {
        matchNumber: 16,
        date: "15 juni 2026",
        time: "21:00",
        homeTeam: "Belgien",
        awayTeam: "Egypten",
      },
      {
        matchNumber: 15,
        date: "16 juni 2026",
        time: "03:00",
        homeTeam: "Iran",
        awayTeam: "Nya Zeeland",
      },
      {
        matchNumber: 39,
        date: "21 juni 2026",
        time: "21:00",
        homeTeam: "Belgien",
        awayTeam: "Iran",
      },
      {
        matchNumber: 40,
        date: "22 juni 2026",
        time: "03:00",
        homeTeam: "Nya Zeeland",
        awayTeam: "Egypten",
      },
      {
        matchNumber: 63,
        date: "27 juni 2026",
        time: "06:00",
        homeTeam: "Egypten",
        awayTeam: "Iran",
      },
      {
        matchNumber: 64,
        date: "27 juni 2026",
        time: "06:00",
        homeTeam: "Nya Zeeland",
        awayTeam: "Belgien",
      },
    ]
  ),

  createScheduledGroup(
    "Grupp H",
    ["Spanien", "Kap Verde", "Saudiarabien", "Uruguay"],
    [
      {
        matchNumber: 14,
        date: "15 juni 2026",
        time: "18:00",
        homeTeam: "Spanien",
        awayTeam: "Kap Verde",
      },
      {
        matchNumber: 13,
        date: "16 juni 2026",
        time: "00:00",
        homeTeam: "Saudiarabien",
        awayTeam: "Uruguay",
      },
      {
        matchNumber: 38,
        date: "21 juni 2026",
        time: "18:00",
        homeTeam: "Spanien",
        awayTeam: "Saudiarabien",
      },
      {
        matchNumber: 37,
        date: "22 juni 2026",
        time: "00:00",
        homeTeam: "Uruguay",
        awayTeam: "Kap Verde",
      },
      {
        matchNumber: 65,
        date: "27 juni 2026",
        time: "02:00",
        homeTeam: "Kap Verde",
        awayTeam: "Saudiarabien",
      },
      {
        matchNumber: 66,
        date: "27 juni 2026",
        time: "03:00",
        homeTeam: "Uruguay",
        awayTeam: "Spanien",
      },
    ]
  ),

  createScheduledGroup(
    "Grupp I",
    ["Frankrike", "Senegal", "FIFA playoff 2", "Norge"],
    [
      {
        matchNumber: 17,
        date: "16 juni 2026",
        time: "21:00",
        homeTeam: "Frankrike",
        awayTeam: "Senegal",
      },
      {
        matchNumber: 18,
        date: "17 juni 2026",
        time: "00:00",
        homeTeam: "FIFA playoff 2",
        awayTeam: "Norge",
      },
      {
        matchNumber: 42,
        date: "22 juni 2026",
        time: "23:00",
        homeTeam: "Frankrike",
        awayTeam: "FIFA playoff 2",
      },
      {
        matchNumber: 41,
        date: "23 juni 2026",
        time: "02:00",
        homeTeam: "Norge",
        awayTeam: "Senegal",
      },
      {
        matchNumber: 61,
        date: "26 juni 2026",
        time: "21:00",
        homeTeam: "Norge",
        awayTeam: "Frankrike",
      },
      {
        matchNumber: 62,
        date: "26 juni 2026",
        time: "21:00",
        homeTeam: "Senegal",
        awayTeam: "FIFA playoff 2",
      },
    ]
  ),

  createScheduledGroup(
    "Grupp J",
    ["Argentina", "Algeriet", "Österrike", "Jordanien"],
    [
      {
        matchNumber: 19,
        date: "17 juni 2026",
        time: "03:00",
        homeTeam: "Argentina",
        awayTeam: "Algeriet",
      },
      {
        matchNumber: 20,
        date: "17 juni 2026",
        time: "04:00",
        homeTeam: "Österrike",
        awayTeam: "Jordanien",
      },
      {
        matchNumber: 43,
        date: "22 juni 2026",
        time: "20:00",
        homeTeam: "Argentina",
        awayTeam: "Österrike",
      },
      {
        matchNumber: 44,
        date: "23 juni 2026",
        time: "03:00",
        homeTeam: "Jordanien",
        awayTeam: "Algeriet",
      },
      {
        matchNumber: 69,
        date: "28 juni 2026",
        time: "03:00",
        homeTeam: "Algeriet",
        awayTeam: "Österrike",
      },
      {
        matchNumber: 70,
        date: "28 juni 2026",
        time: "03:00",
        homeTeam: "Jordanien",
        awayTeam: "Argentina",
      },
    ]
  ),

  createScheduledGroup(
    "Grupp K",
    ["Portugal", "FIFA playoff 1", "Uzbekistan", "Colombia"],
    [
      {
        matchNumber: 23,
        date: "17 juni 2026",
        time: "19:00",
        homeTeam: "Portugal",
        awayTeam: "FIFA playoff 1",
      },
      {
        matchNumber: 24,
        date: "18 juni 2026",
        time: "03:00",
        homeTeam: "Uzbekistan",
        awayTeam: "Colombia",
      },
      {
        matchNumber: 47,
        date: "23 juni 2026",
        time: "19:00",
        homeTeam: "Portugal",
        awayTeam: "Uzbekistan",
      },
      {
        matchNumber: 48,
        date: "24 juni 2026",
        time: "03:00",
        homeTeam: "Colombia",
        awayTeam: "FIFA playoff 1",
      },
      {
        matchNumber: 71,
        date: "28 juni 2026",
        time: "01:30",
        homeTeam: "Colombia",
        awayTeam: "Portugal",
      },
      {
        matchNumber: 72,
        date: "28 juni 2026",
        time: "01:30",
        homeTeam: "FIFA playoff 1",
        awayTeam: "Uzbekistan",
      },
    ]
  ),

  createScheduledGroup(
    "Grupp L",
    ["England", "Kroatien", "Ghana", "Panama"],
    [
      {
        matchNumber: 22,
        date: "17 juni 2026",
        time: "22:00",
        homeTeam: "England",
        awayTeam: "Kroatien",
      },
      {
        matchNumber: 21,
        date: "18 juni 2026",
        time: "01:00",
        homeTeam: "Ghana",
        awayTeam: "Panama",
      },
      {
        matchNumber: 45,
        date: "23 juni 2026",
        time: "22:00",
        homeTeam: "England",
        awayTeam: "Ghana",
      },
      {
        matchNumber: 46,
        date: "24 juni 2026",
        time: "01:00",
        homeTeam: "Panama",
        awayTeam: "Kroatien",
      },
      {
        matchNumber: 67,
        date: "27 juni 2026",
        time: "23:00",
        homeTeam: "Panama",
        awayTeam: "England",
      },
      {
        matchNumber: 68,
        date: "27 juni 2026",
        time: "23:00",
        homeTeam: "Kroatien",
        awayTeam: "Ghana",
      },
    ]
  ),
];

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomScore() {
  const home = randomInt(0, 4);
  const away = randomInt(0, 4);

  return {
    homeGoals: String(home),
    awayGoals: String(away),
  };
}

export function pickRandomWinner(home: string, away: string) {
  if (!home) return away;
  if (!away) return home;
  return Math.random() < 0.5 ? home : away;
}

export function calculateTable(teams: string[], matches: Match[]): TableRow[] {
  const rows: TableRow[] = teams.map((team, index) => ({
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
    fairPlay: 0,
    fifaRank: index + 1,
  }));

  function getRow(teamName: string) {
    return rows.find((row) => row.team === teamName)!;
  }

  matches.forEach((match) => {
    if (match.homeGoals === "" || match.awayGoals === "") return;

    const homeGoals = Number(match.homeGoals);
    const awayGoals = Number(match.awayGoals);

    const homeRow = getRow(match.homeTeam);
    const awayRow = getRow(match.awayTeam);

    homeRow.played += 1;
    awayRow.played += 1;

    homeRow.goalsFor += homeGoals;
    homeRow.goalsAgainst += awayGoals;

    awayRow.goalsFor += awayGoals;
    awayRow.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      homeRow.won += 1;
      awayRow.lost += 1;
      homeRow.points += 3;
    } else if (awayGoals > homeGoals) {
      awayRow.won += 1;
      homeRow.lost += 1;
      awayRow.points += 3;
    } else {
      homeRow.drawn += 1;
      awayRow.drawn += 1;
      homeRow.points += 1;
      awayRow.points += 1;
    }
  });

  rows.forEach((row) => {
    row.goalDiff = row.goalsFor - row.goalsAgainst;
  });

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    if (a.fairPlay !== b.fairPlay) return a.fairPlay - b.fairPlay;
    if (a.fifaRank !== b.fifaRank) return a.fifaRank - b.fifaRank;
    return a.team.localeCompare(b.team);
  });

  return rows;
}

export function getBestThirds(groups: GroupData[]): ThirdPlaceRow[] {
  const thirdPlacedTeams: ThirdPlaceRow[] = groups.map((group) => {
    const table = calculateTable(group.teams, group.matches);
    const third = table[2];
    const groupLetter = group.name.replace("Grupp ", "");

    return {
      ...third,
      groupName: group.name,
      groupLetter,
    };
  });

  thirdPlacedTeams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    if (a.fairPlay !== b.fairPlay) return a.fairPlay - b.fairPlay;
    if (a.fifaRank !== b.fifaRank) return a.fifaRank - b.fifaRank;
    return a.team.localeCompare(b.team);
  });

  return thirdPlacedTeams.map((team, index) => ({
    ...team,
    isQualified: index < 8,
  }));
}

export function buildNextRound(
  previousMatches: KnockoutMatch[] | undefined,
  selectedWinners: Record<string, string>,
  prefix: string,
  labelPrefix: string
): KnockoutMatch[] {
  const safeMatches = previousMatches ?? [];
  const matches: KnockoutMatch[] = [];

  for (let i = 0; i < safeMatches.length; i += 2) {
    const homeWinner = selectedWinners[safeMatches[i]?.id] ?? "";
    const awayWinner = selectedWinners[safeMatches[i + 1]?.id] ?? "";

    matches.push({
      id: `${prefix}-${i / 2 + 1}`,
      label: `${labelPrefix} ${i / 2 + 1}`,
      home: homeWinner,
      away: awayWinner,
    });
  }

  return matches;
}

export function buildRoundFromPairs(
  definitions: Array<{
    id: string;
    label: string;
    homeFrom: string;
    awayFrom: string;
  }>,
  selectedWinners: Record<string, string>
): KnockoutMatch[] {
  return definitions.map((def) => ({
    id: def.id,
    label: def.label,
    home: selectedWinners[def.homeFrom] ?? "",
    away: selectedWinners[def.awayFrom] ?? "",
  }));
}

export function getLoser(match: KnockoutMatch, selectedWinners: Record<string, string>) {
  const winner = selectedWinners[match.id];
  if (!winner) return "";
  if (winner === match.home) return match.away;
  if (winner === match.away) return match.home;
  return "";
}

export function getKnockoutSeedData(groups: GroupData[]) {
  const groupTables = groups.map((group) => {
    const table = calculateTable(group.teams, group.matches);
    return {
      groupLetter: group.name.replace("Grupp ", ""),
      winner: table[0]?.team ?? "",
      runnerUp: table[1]?.team ?? "",
    };
  });

  const winnersByGroup = Object.fromEntries(
    groupTables.map((g) => [g.groupLetter, g.winner])
  ) as Record<string, string>;

  const runnersByGroup = Object.fromEntries(
    groupTables.map((g) => [g.groupLetter, g.runnerUp])
  ) as Record<string, string>;

  const qualifiedThirds = getBestThirds(groups).filter((t) => t.isQualified);

  const qualifiedThirdLetters = qualifiedThirds
    .map((t) => t.groupLetter)
    .sort();

  const mapping = getThirdPlaceMapping(qualifiedThirdLetters);

  const thirdTeamBySlot: Record<string, string> = {
    A: qualifiedThirds.find((t) => t.groupLetter === mapping[0])?.team ?? "",
    B: qualifiedThirds.find((t) => t.groupLetter === mapping[1])?.team ?? "",
    D: qualifiedThirds.find((t) => t.groupLetter === mapping[2])?.team ?? "",
    E: qualifiedThirds.find((t) => t.groupLetter === mapping[3])?.team ?? "",
    G: qualifiedThirds.find((t) => t.groupLetter === mapping[4])?.team ?? "",
    I: qualifiedThirds.find((t) => t.groupLetter === mapping[5])?.team ?? "",
    K: qualifiedThirds.find((t) => t.groupLetter === mapping[6])?.team ?? "",
    L: qualifiedThirds.find((t) => t.groupLetter === mapping[7])?.team ?? "",
  };

  console.log("Qualified third groups:", qualifiedThirdLetters.join(""));
  console.log("Mapping:", mapping);
  console.log("Third teams by slot:", thirdTeamBySlot);

  const round32: KnockoutMatch[] = [
    // Vänster sida uppifrån och ner
    {
      id: "m74",
      label: "Match 74",
      home: winnersByGroup["E"] ?? "",
      away: thirdTeamBySlot["E"] ?? "",
    },
    {
      id: "m77",
      label: "Match 77",
      home: winnersByGroup["I"] ?? "",
      away: thirdTeamBySlot["I"] ?? "",
    },
    {
      id: "m73",
      label: "Match 73",
      home: runnersByGroup["A"] ?? "",
      away: runnersByGroup["B"] ?? "",
    },
    {
      id: "m75",
      label: "Match 75",
      home: winnersByGroup["F"] ?? "",
      away: runnersByGroup["C"] ?? "",
    },
    {
      id: "m83",
      label: "Match 83",
      home: runnersByGroup["K"] ?? "",
      away: runnersByGroup["L"] ?? "",
    },
    {
      id: "m84",
      label: "Match 84",
      home: winnersByGroup["H"] ?? "",
      away: runnersByGroup["J"] ?? "",
    },
    {
      id: "m81",
      label: "Match 81",
      home: winnersByGroup["D"] ?? "",
      away: thirdTeamBySlot["D"] ?? "",
    },
    {
      id: "m82",
      label: "Match 82",
      home: winnersByGroup["G"] ?? "",
      away: thirdTeamBySlot["G"] ?? "",
    },

    // Höger sida uppifrån och ner
    {
      id: "m76",
      label: "Match 76",
      home: winnersByGroup["C"] ?? "",
      away: runnersByGroup["F"] ?? "",
    },
    {
      id: "m78",
      label: "Match 78",
      home: runnersByGroup["E"] ?? "",
      away: runnersByGroup["I"] ?? "",
    },
    {
      id: "m79",
      label: "Match 79",
      home: winnersByGroup["A"] ?? "",
      away: thirdTeamBySlot["A"] ?? "",
    },
    {
      id: "m80",
      label: "Match 80",
      home: winnersByGroup["L"] ?? "",
      away: thirdTeamBySlot["L"] ?? "",
    },
    {
      id: "m86",
      label: "Match 86",
      home: winnersByGroup["J"] ?? "",
      away: runnersByGroup["H"] ?? "",
    },
    {
      id: "m88",
      label: "Match 88",
      home: runnersByGroup["D"] ?? "",
      away: runnersByGroup["G"] ?? "",
    },
    {
      id: "m85",
      label: "Match 85",
      home: winnersByGroup["B"] ?? "",
      away: thirdTeamBySlot["B"] ?? "",
    },
    {
      id: "m87",
      label: "Match 87",
      home: winnersByGroup["K"] ?? "",
      away: thirdTeamBySlot["K"] ?? "",
    },
  ];

  return { round32 };
}

export function isGroupComplete(group: GroupData) {
  return group.matches.every((match) => match.homeGoals !== "" && match.awayGoals !== "");
}

export function isTournamentGroupStageComplete(groups: GroupData[]) {
  return groups.every(isGroupComplete);
}

export function clearDependentKnockoutSelections(
  winners: Record<string, string>,
  changedMatchId: string
) {
  const next = { ...winners };

  const dependencyMap: Record<string, string[]> = {
    m74: ["m89", "m97", "m101", "m104", "m103"],
    m77: ["m89", "m97", "m101", "m104", "m103"],
    m73: ["m90", "m97", "m101", "m104", "m103"],
    m75: ["m90", "m97", "m101", "m104", "m103"],
    m83: ["m93", "m98", "m101", "m104", "m103"],
    m84: ["m93", "m98", "m101", "m104", "m103"],
    m81: ["m94", "m98", "m101", "m104", "m103"],
    m82: ["m94", "m98", "m101", "m104", "m103"],

    m76: ["m91", "m99", "m102", "m104", "m103"],
    m78: ["m91", "m99", "m102", "m104", "m103"],
    m79: ["m92", "m99", "m102", "m104", "m103"],
    m80: ["m92", "m99", "m102", "m104", "m103"],
    m86: ["m95", "m100", "m102", "m104", "m103"],
    m88: ["m95", "m100", "m102", "m104", "m103"],
    m85: ["m96", "m100", "m102", "m104", "m103"],
    m87: ["m96", "m100", "m102", "m104", "m103"],

    m89: ["m97", "m101", "m104", "m103"],
    m90: ["m97", "m101", "m104", "m103"],
    m93: ["m98", "m101", "m104", "m103"],
    m94: ["m98", "m101", "m104", "m103"],

    m91: ["m99", "m102", "m104", "m103"],
    m92: ["m99", "m102", "m104", "m103"],
    m95: ["m100", "m102", "m104", "m103"],
    m96: ["m100", "m102", "m104", "m103"],

    m97: ["m101", "m104", "m103"],
    m98: ["m101", "m104", "m103"],
    m99: ["m102", "m104", "m103"],
    m100: ["m102", "m104", "m103"],

    m101: ["m104", "m103"],
    m102: ["m104", "m103"],
  };

  for (const dependentId of dependencyMap[changedMatchId] ?? []) {
    delete next[dependentId];
  }

  return next;
}