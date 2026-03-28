import { describe, expect, it } from "vitest";
import type { GroupData } from "@/types/tournament";
import {
  scoreGroupMatches,
  scoreTablePlacements,
  scorePrediction,
} from "./scoring";

function createGroup(
  name: string,
  teams: string[],
  matches: Array<{
    matchNumber: number;
    homeTeam: string;
    awayTeam: string;
    homeGoals: string;
    awayGoals: string;
  }>
): GroupData {
  return {
    name,
    teams,
    matches: matches.map((match) => ({
      id: match.matchNumber,
      matchNumber: match.matchNumber,
      date: "",
      time: "",
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeGoals: match.homeGoals,
      awayGoals: match.awayGoals,
    })),
  };
}

function createFinishedTournamentGroups(): GroupData[] {
  return [
    createGroup("Grupp A", ["A1", "A2", "A3", "A4"], [
      { matchNumber: 1, homeTeam: "A1", awayTeam: "A2", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 2, homeTeam: "A3", awayTeam: "A4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 3, homeTeam: "A1", awayTeam: "A3", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 4, homeTeam: "A2", awayTeam: "A4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 5, homeTeam: "A1", awayTeam: "A4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 6, homeTeam: "A2", awayTeam: "A3", homeGoals: "0", awayGoals: "1" },
    ]),
    createGroup("Grupp B", ["B1", "B2", "B3", "B4"], [
      { matchNumber: 7, homeTeam: "B1", awayTeam: "B2", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 8, homeTeam: "B3", awayTeam: "B4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 9, homeTeam: "B1", awayTeam: "B3", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 10, homeTeam: "B2", awayTeam: "B4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 11, homeTeam: "B1", awayTeam: "B4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 12, homeTeam: "B2", awayTeam: "B3", homeGoals: "0", awayGoals: "1" },
    ]),
    createGroup("Grupp C", ["C1", "C2", "C3", "C4"], [
      { matchNumber: 13, homeTeam: "C1", awayTeam: "C2", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 14, homeTeam: "C3", awayTeam: "C4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 15, homeTeam: "C1", awayTeam: "C3", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 16, homeTeam: "C2", awayTeam: "C4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 17, homeTeam: "C1", awayTeam: "C4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 18, homeTeam: "C2", awayTeam: "C3", homeGoals: "0", awayGoals: "1" },
    ]),
    createGroup("Grupp D", ["D1", "D2", "D3", "D4"], [
      { matchNumber: 19, homeTeam: "D1", awayTeam: "D2", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 20, homeTeam: "D3", awayTeam: "D4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 21, homeTeam: "D1", awayTeam: "D3", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 22, homeTeam: "D2", awayTeam: "D4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 23, homeTeam: "D1", awayTeam: "D4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 24, homeTeam: "D2", awayTeam: "D3", homeGoals: "0", awayGoals: "1" },
    ]),
    createGroup("Grupp E", ["E1", "E2", "E3", "E4"], [
      { matchNumber: 25, homeTeam: "E1", awayTeam: "E2", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 26, homeTeam: "E3", awayTeam: "E4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 27, homeTeam: "E1", awayTeam: "E3", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 28, homeTeam: "E2", awayTeam: "E4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 29, homeTeam: "E1", awayTeam: "E4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 30, homeTeam: "E2", awayTeam: "E3", homeGoals: "0", awayGoals: "1" },
    ]),
    createGroup("Grupp F", ["F1", "F2", "F3", "F4"], [
      { matchNumber: 31, homeTeam: "F1", awayTeam: "F2", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 32, homeTeam: "F3", awayTeam: "F4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 33, homeTeam: "F1", awayTeam: "F3", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 34, homeTeam: "F2", awayTeam: "F4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 35, homeTeam: "F1", awayTeam: "F4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 36, homeTeam: "F2", awayTeam: "F3", homeGoals: "0", awayGoals: "1" },
    ]),
    createGroup("Grupp G", ["G1", "G2", "G3", "G4"], [
      { matchNumber: 37, homeTeam: "G1", awayTeam: "G2", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 38, homeTeam: "G3", awayTeam: "G4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 39, homeTeam: "G1", awayTeam: "G3", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 40, homeTeam: "G2", awayTeam: "G4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 41, homeTeam: "G1", awayTeam: "G4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 42, homeTeam: "G2", awayTeam: "G3", homeGoals: "0", awayGoals: "1" },
    ]),
    createGroup("Grupp H", ["H1", "H2", "H3", "H4"], [
      { matchNumber: 43, homeTeam: "H1", awayTeam: "H2", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 44, homeTeam: "H3", awayTeam: "H4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 45, homeTeam: "H1", awayTeam: "H3", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 46, homeTeam: "H2", awayTeam: "H4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 47, homeTeam: "H1", awayTeam: "H4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 48, homeTeam: "H2", awayTeam: "H3", homeGoals: "0", awayGoals: "1" },
    ]),
    createGroup("Grupp I", ["I1", "I2", "I3", "I4"], [
      { matchNumber: 49, homeTeam: "I1", awayTeam: "I2", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 50, homeTeam: "I3", awayTeam: "I4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 51, homeTeam: "I1", awayTeam: "I3", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 52, homeTeam: "I2", awayTeam: "I4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 53, homeTeam: "I1", awayTeam: "I4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 54, homeTeam: "I2", awayTeam: "I3", homeGoals: "0", awayGoals: "1" },
    ]),
    createGroup("Grupp J", ["J1", "J2", "J3", "J4"], [
      { matchNumber: 55, homeTeam: "J1", awayTeam: "J2", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 56, homeTeam: "J3", awayTeam: "J4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 57, homeTeam: "J1", awayTeam: "J3", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 58, homeTeam: "J2", awayTeam: "J4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 59, homeTeam: "J1", awayTeam: "J4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 60, homeTeam: "J2", awayTeam: "J3", homeGoals: "0", awayGoals: "1" },
    ]),
    createGroup("Grupp K", ["K1", "K2", "K3", "K4"], [
      { matchNumber: 61, homeTeam: "K1", awayTeam: "K2", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 62, homeTeam: "K3", awayTeam: "K4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 63, homeTeam: "K1", awayTeam: "K3", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 64, homeTeam: "K2", awayTeam: "K4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 65, homeTeam: "K1", awayTeam: "K4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 66, homeTeam: "K2", awayTeam: "K3", homeGoals: "0", awayGoals: "1" },
    ]),
    createGroup("Grupp L", ["L1", "L2", "L3", "L4"], [
      { matchNumber: 67, homeTeam: "L1", awayTeam: "L2", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 68, homeTeam: "L3", awayTeam: "L4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 69, homeTeam: "L1", awayTeam: "L3", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 70, homeTeam: "L2", awayTeam: "L4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 71, homeTeam: "L1", awayTeam: "L4", homeGoals: "1", awayGoals: "0" },
      { matchNumber: 72, homeTeam: "L2", awayTeam: "L3", homeGoals: "0", awayGoals: "1" },
    ]),
  ];
}

describe("scoring", () => {
  it("ger 3 poäng för rätt utfall och +1 bonus för exakt resultat", () => {
    const predictionGroups = [
      createGroup("Grupp A", ["Lag A", "Lag B"], [
        {
          matchNumber: 1,
          homeTeam: "Lag A",
          awayTeam: "Lag B",
          homeGoals: "2",
          awayGoals: "1",
        },
      ]),
    ];

    const resultGroups = [
      createGroup("Grupp A", ["Lag A", "Lag B"], [
        {
          matchNumber: 1,
          homeTeam: "Lag A",
          awayTeam: "Lag B",
          homeGoals: "2",
          awayGoals: "1",
        },
      ]),
    ];

    const result = scoreGroupMatches(predictionGroups, resultGroups);

    expect(result.rightOutcomePoints).toBe(3);
    expect(result.exactScoreBonusPoints).toBe(1);
    expect(result.total).toBe(4);
  });

  it("ger bara 3 poäng för rätt utfall men inte exakt resultat", () => {
    const predictionGroups = [
      createGroup("Grupp A", ["Lag A", "Lag B"], [
        {
          matchNumber: 1,
          homeTeam: "Lag A",
          awayTeam: "Lag B",
          homeGoals: "3",
          awayGoals: "1",
        },
      ]),
    ];

    const resultGroups = [
      createGroup("Grupp A", ["Lag A", "Lag B"], [
        {
          matchNumber: 1,
          homeTeam: "Lag A",
          awayTeam: "Lag B",
          homeGoals: "2",
          awayGoals: "1",
        },
      ]),
    ];

    const result = scoreGroupMatches(predictionGroups, resultGroups);

    expect(result.rightOutcomePoints).toBe(3);
    expect(result.exactScoreBonusPoints).toBe(0);
    expect(result.total).toBe(3);
  });

  it("ger 0 poäng vid fel utfall", () => {
    const predictionGroups = [
      createGroup("Grupp A", ["Lag A", "Lag B"], [
        {
          matchNumber: 1,
          homeTeam: "Lag A",
          awayTeam: "Lag B",
          homeGoals: "0",
          awayGoals: "1",
        },
      ]),
    ];

    const resultGroups = [
      createGroup("Grupp A", ["Lag A", "Lag B"], [
        {
          matchNumber: 1,
          homeTeam: "Lag A",
          awayTeam: "Lag B",
          homeGoals: "2",
          awayGoals: "1",
        },
      ]),
    ];

    const result = scoreGroupMatches(predictionGroups, resultGroups);

    expect(result.rightOutcomePoints).toBe(0);
    expect(result.exactScoreBonusPoints).toBe(0);
    expect(result.total).toBe(0);
  });

  it("ger 1 poäng per rätt tabellplacering", () => {
    const predictionGroups = [
      createGroup("Grupp A", ["A", "B", "C", "D"], [
        { matchNumber: 1, homeTeam: "A", awayTeam: "B", homeGoals: "1", awayGoals: "0" },
        { matchNumber: 2, homeTeam: "C", awayTeam: "D", homeGoals: "1", awayGoals: "0" },
        { matchNumber: 3, homeTeam: "A", awayTeam: "C", homeGoals: "1", awayGoals: "0" },
        { matchNumber: 4, homeTeam: "B", awayTeam: "D", homeGoals: "1", awayGoals: "0" },
        { matchNumber: 5, homeTeam: "A", awayTeam: "D", homeGoals: "1", awayGoals: "0" },
        { matchNumber: 6, homeTeam: "B", awayTeam: "C", homeGoals: "0", awayGoals: "1" },
      ]),
    ];

    const resultGroups = [
      createGroup("Grupp A", ["A", "B", "C", "D"], [
        { matchNumber: 1, homeTeam: "A", awayTeam: "B", homeGoals: "1", awayGoals: "0" },
        { matchNumber: 2, homeTeam: "C", awayTeam: "D", homeGoals: "1", awayGoals: "0" },
        { matchNumber: 3, homeTeam: "A", awayTeam: "C", homeGoals: "1", awayGoals: "0" },
        { matchNumber: 4, homeTeam: "B", awayTeam: "D", homeGoals: "1", awayGoals: "0" },
        { matchNumber: 5, homeTeam: "A", awayTeam: "D", homeGoals: "1", awayGoals: "0" },
        { matchNumber: 6, homeTeam: "B", awayTeam: "C", homeGoals: "0", awayGoals: "1" },
      ]),
    ];

    const points = scoreTablePlacements(predictionGroups, resultGroups);
    expect(points).toBe(4);
  });

  it("ger poäng i slutspel när rätt lag återfinns i rätt omgång", () => {
    const groups = createFinishedTournamentGroups();

    const predictionKnockout = {
      m74: "E1",
      m77: "I1",
      m73: "A2",
      m75: "F1",
      m83: "K2",
      m84: "H1",
      m81: "D1",
      m82: "G1",

      m76: "C1",
      m78: "E2",
      m79: "A1",
      m80: "L1",
      m86: "J1",
      m88: "D2",
      m85: "B1",
      m87: "K1",

      m89: "E1",
      m90: "F1",
      m93: "H1",
      m94: "D1",
      m91: "C1",
      m92: "A1",
      m95: "J1",
      m96: "K1",

      m97: "E1",
      m98: "H1",
      m99: "A1",
      m100: "K1",

      m101: "E1",
      m102: "A1",

      m103: "H1",
      m104: "E1",
    };

    const resultKnockout = { ...predictionKnockout };

    const result = scorePrediction(
      groups,
      predictionKnockout,
      groups,
      resultKnockout,
      null,
      null
    );

    expect(result.round32Points).toBeGreaterThan(0);
    expect(result.round16Points).toBeGreaterThan(0);
    expect(result.quarterfinalPoints).toBeGreaterThan(0);
    expect(result.semifinalPoints).toBeGreaterThan(0);
    expect(result.finalPoints).toBeGreaterThan(0);
    expect(result.winnerBonusPoints).toBe(12);
  });

  it("ger 7 poäng för rätt skyttekung oavsett stora/små bokstäver", () => {
    const groups = [
      createGroup("Grupp A", ["A", "B"], [
        {
          matchNumber: 1,
          homeTeam: "A",
          awayTeam: "B",
          homeGoals: "1",
          awayGoals: "0",
        },
      ]),
    ];

    const result = scorePrediction(groups, {}, groups, {}, "Mbappé", "mbappé");

    expect(result.goldenBootPoints).toBe(7);
  });

  it("räknar totalen korrekt för gruppmatch + exakt resultat + skyttekung", () => {
    const predictionGroups = [
      createGroup("Grupp A", ["A", "B", "C", "D"], [
        { matchNumber: 1, homeTeam: "A", awayTeam: "B", homeGoals: "2", awayGoals: "1" },
        { matchNumber: 2, homeTeam: "C", awayTeam: "D", homeGoals: "", awayGoals: "" },
        { matchNumber: 3, homeTeam: "A", awayTeam: "C", homeGoals: "", awayGoals: "" },
        { matchNumber: 4, homeTeam: "B", awayTeam: "D", homeGoals: "", awayGoals: "" },
        { matchNumber: 5, homeTeam: "A", awayTeam: "D", homeGoals: "", awayGoals: "" },
        { matchNumber: 6, homeTeam: "B", awayTeam: "C", homeGoals: "", awayGoals: "" },
      ]),
    ];

    const resultGroups = [
      createGroup("Grupp A", ["A", "B", "C", "D"], [
        { matchNumber: 1, homeTeam: "A", awayTeam: "B", homeGoals: "2", awayGoals: "1" },
        { matchNumber: 2, homeTeam: "C", awayTeam: "D", homeGoals: "", awayGoals: "" },
        { matchNumber: 3, homeTeam: "A", awayTeam: "C", homeGoals: "", awayGoals: "" },
        { matchNumber: 4, homeTeam: "B", awayTeam: "D", homeGoals: "", awayGoals: "" },
        { matchNumber: 5, homeTeam: "A", awayTeam: "D", homeGoals: "", awayGoals: "" },
        { matchNumber: 6, homeTeam: "B", awayTeam: "C", homeGoals: "", awayGoals: "" },
      ]),
    ];

    const result = scorePrediction(
      predictionGroups,
      {},
      resultGroups,
      {},
      "Mbappé",
      "Mbappé"
    );

    expect(result.groupMatchPoints).toBe(3);
    expect(result.exactScoreBonusPoints).toBe(1);
    expect(result.tablePlacementPoints).toBe(0);
    expect(result.round32Points).toBe(0);
    expect(result.round16Points).toBe(0);
    expect(result.quarterfinalPoints).toBe(0);
    expect(result.semifinalPoints).toBe(0);
    expect(result.finalPoints).toBe(0);
    expect(result.bronzeMatchPoints).toBe(0);
    expect(result.winnerBonusPoints).toBe(0);
    expect(result.goldenBootPoints).toBe(7);
    expect(result.total).toBe(11);
  });
});