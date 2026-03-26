import { buildNextRound, calculateTable, getKnockoutSeedData } from "@/lib/tournament";
import type { GroupData, KnockoutMatch } from "@/types/tournament";

type KnockoutSelections = Record<string, string>;

export type ScoreBreakdown = {
  groupMatchPoints: number;
  exactScoreBonusPoints: number;
  tablePlacementPoints: number;
  round32Points: number;
  round16Points: number;
  quarterfinalPoints: number;
  semifinalPoints: number;
  finalPoints: number;
  bronzeMatchPoints: number;
  winnerBonusPoints: number;
  goldenBootPoints: number;
  total: number;
};

function getOutcome(homeGoals: string, awayGoals: string) {
  const home = Number(homeGoals);
  const away = Number(awayGoals);

  if (home > away) return "HOME";
  if (away > home) return "AWAY";
  return "DRAW";
}

function createOfficialMatchMap(groups: GroupData[]) {
  const map = new Map<number, { homeGoals: string; awayGoals: string }>();

  for (const group of groups) {
    for (const match of group.matches) {
      map.set(match.matchNumber, {
        homeGoals: match.homeGoals,
        awayGoals: match.awayGoals,
      });
    }
  }

  return map;
}

export function scoreGroupMatches(
  predictionGroups: GroupData[],
  resultGroups: GroupData[]
) {
  const officialMap = createOfficialMatchMap(resultGroups);

  let rightOutcomePoints = 0;
  let exactScoreBonusPoints = 0;

  for (const group of predictionGroups) {
    for (const match of group.matches) {
      const official = officialMap.get(match.matchNumber);

      if (!official) continue;
      if (
        match.homeGoals === "" ||
        match.awayGoals === "" ||
        official.homeGoals === "" ||
        official.awayGoals === ""
      ) {
        continue;
      }

      const predictedOutcome = getOutcome(match.homeGoals, match.awayGoals);
      const officialOutcome = getOutcome(official.homeGoals, official.awayGoals);

      if (predictedOutcome === officialOutcome) {
        rightOutcomePoints += 3;
      }

      if (
        match.homeGoals === official.homeGoals &&
        match.awayGoals === official.awayGoals
      ) {
        exactScoreBonusPoints += 1;
      }
    }
  }

  return {
    rightOutcomePoints,
    exactScoreBonusPoints,
    total: rightOutcomePoints + exactScoreBonusPoints,
  };
}

export function scoreTablePlacements(
  predictionGroups: GroupData[],
  resultGroups: GroupData[]
) {
  let points = 0;

  for (const predictedGroup of predictionGroups) {
    const officialGroup = resultGroups.find(
      (group) => group.name === predictedGroup.name
    );

    if (!officialGroup) continue;

    const officialGroupComplete = officialGroup.matches.every(
      (match) => match.homeGoals !== "" && match.awayGoals !== ""
    );

    if (!officialGroupComplete) continue;

    const predictedTable = calculateTable(
      predictedGroup.teams,
      predictedGroup.matches
    );
    const officialTable = calculateTable(
      officialGroup.teams,
      officialGroup.matches
    );

    for (let i = 0; i < 4; i += 1) {
      if (predictedTable[i]?.team === officialTable[i]?.team) {
        points += 1;
      }
    }
  }

  return points;
}

function uniqueTeamsFromMatches(matches: KnockoutMatch[]) {
  const teams = new Set<string>();

  for (const match of matches) {
    if (match.home) teams.add(match.home);
    if (match.away) teams.add(match.away);
  }

  return teams;
}

function getLoserTeam(match: KnockoutMatch, winners: KnockoutSelections) {
  const winner = winners[match.id];
  if (!winner) return "";
  if (winner === match.home) return match.away;
  if (winner === match.away) return match.home;
  return "";
}

function buildKnockoutRounds(
  groups: GroupData[],
  winners: KnockoutSelections
) {
  const { round32 } = getKnockoutSeedData(groups);

  const round16 = buildNextRound(round32, winners, "r16", "Åttondelsfinal").map(
    (match, index) => ({
      ...match,
      id: `m${89 + index}`,
    })
  );

  const quarterfinals = buildNextRound(
    round16,
    winners,
    "qf",
    "Kvartsfinal"
  ).map((match, index) => ({
    ...match,
    id: `m${97 + index}`,
  }));

  const semifinals = buildNextRound(
    quarterfinals,
    winners,
    "sf",
    "Semifinal"
  ).map((match, index) => ({
    ...match,
    id: `m${101 + index}`,
  }));

  const final = buildNextRound(semifinals, winners, "final", "Final").map(
    (match) => ({
      ...match,
      id: "m104",
    })
  );

  const bronze =
    semifinals.length === 2
      ? [
          {
            id: "m103",
            label: "Bronsmatch",
            home: getLoserTeam(semifinals[0], winners),
            away: getLoserTeam(semifinals[1], winners),
          },
        ]
      : [];

  return {
    round32,
    round16,
    quarterfinals,
    semifinals,
    final,
    bronze,
  };
}

function scoreTeamsInRound(
  predictedTeams: Set<string>,
  officialTeams: Set<string>,
  pointsPerTeam: number
) {
  let points = 0;

  predictedTeams.forEach((team) => {
    if (officialTeams.has(team)) {
      points += pointsPerTeam;
    }
  });

  return points;
}

export function scoreKnockout(
  predictionGroups: GroupData[],
  predictionKnockout: KnockoutSelections,
  resultGroups: GroupData[],
  resultKnockout: KnockoutSelections
) {
  const predictedRounds = buildKnockoutRounds(predictionGroups, predictionKnockout);
  const officialRounds = buildKnockoutRounds(resultGroups, resultKnockout);

  const round32Points = scoreTeamsInRound(
    uniqueTeamsFromMatches(predictedRounds.round32),
    uniqueTeamsFromMatches(officialRounds.round32),
    2
  );

  const round16Points = scoreTeamsInRound(
    uniqueTeamsFromMatches(predictedRounds.round16),
    uniqueTeamsFromMatches(officialRounds.round16),
    2
  );

  const quarterfinalPoints = scoreTeamsInRound(
    uniqueTeamsFromMatches(predictedRounds.quarterfinals),
    uniqueTeamsFromMatches(officialRounds.quarterfinals),
    3
  );

  const semifinalPoints = scoreTeamsInRound(
    uniqueTeamsFromMatches(predictedRounds.semifinals),
    uniqueTeamsFromMatches(officialRounds.semifinals),
    4
  );

  const finalPoints = scoreTeamsInRound(
    uniqueTeamsFromMatches(predictedRounds.final),
    uniqueTeamsFromMatches(officialRounds.final),
    7
  );

  const bronzeMatchPoints = scoreTeamsInRound(
    uniqueTeamsFromMatches(predictedRounds.bronze),
    uniqueTeamsFromMatches(officialRounds.bronze),
    5
  );

  const predictedWinner = predictionKnockout["m104"] ?? "";
  const officialWinner = resultKnockout["m104"] ?? "";

  const winnerBonusPoints =
    predictedWinner && officialWinner && predictedWinner === officialWinner
      ? 12
      : 0;

  return {
    round32Points,
    round16Points,
    quarterfinalPoints,
    semifinalPoints,
    finalPoints,
    bronzeMatchPoints,
    winnerBonusPoints,
    total:
      round32Points +
      round16Points +
      quarterfinalPoints +
      semifinalPoints +
      finalPoints +
      bronzeMatchPoints +
      winnerBonusPoints,
  };
}

export function scorePrediction(
  predictionGroups: GroupData[],
  predictionKnockout: KnockoutSelections,
  resultGroups: GroupData[],
  resultKnockout: KnockoutSelections,
  predictedGoldenBoot?: string | null,
  officialGoldenBoot?: string | null
): ScoreBreakdown {
  const groupMatchScore = scoreGroupMatches(predictionGroups, resultGroups);
  const tablePlacementPoints = scoreTablePlacements(
    predictionGroups,
    resultGroups
  );
  const knockoutScore = scoreKnockout(
    predictionGroups,
    predictionKnockout,
    resultGroups,
    resultKnockout
  );

  const goldenBootPoints =
    predictedGoldenBoot &&
    officialGoldenBoot &&
    predictedGoldenBoot === officialGoldenBoot
      ? 7
      : 0;

  const total =
    groupMatchScore.rightOutcomePoints +
    groupMatchScore.exactScoreBonusPoints +
    tablePlacementPoints +
    knockoutScore.round32Points +
    knockoutScore.round16Points +
    knockoutScore.quarterfinalPoints +
    knockoutScore.semifinalPoints +
    knockoutScore.finalPoints +
    knockoutScore.bronzeMatchPoints +
    knockoutScore.winnerBonusPoints +
    goldenBootPoints;

  return {
    groupMatchPoints: groupMatchScore.rightOutcomePoints,
    exactScoreBonusPoints: groupMatchScore.exactScoreBonusPoints,
    tablePlacementPoints,
    round32Points: knockoutScore.round32Points,
    round16Points: knockoutScore.round16Points,
    quarterfinalPoints: knockoutScore.quarterfinalPoints,
    semifinalPoints: knockoutScore.semifinalPoints,
    finalPoints: knockoutScore.finalPoints,
    bronzeMatchPoints: knockoutScore.bronzeMatchPoints,
    winnerBonusPoints: knockoutScore.winnerBonusPoints,
    goldenBootPoints,
    total,
  };
}