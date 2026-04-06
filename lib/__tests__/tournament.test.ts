import { describe, it, expect } from "vitest";
import {
  calculateTable,
  getBestThirds,
  getKnockoutSeedData,
  buildRoundFromPairs,
  getLoser,
  isGroupComplete,
  isTournamentGroupStageComplete,
  clearDependentKnockoutSelections,
  initialGroups,
} from "@/lib/tournament";
import type { GroupData, Match, KnockoutMatch } from "@/types/tournament";

function cloneGroups(): GroupData[] {
  return JSON.parse(JSON.stringify(initialGroups));
}

function fillAllMatches(groups: GroupData[]): GroupData[] {
  return groups.map((group, groupIndex) => ({
    ...group,
    matches: group.matches.map((match, matchIndex) => ({
      ...match,
      homeGoals: String((groupIndex + matchIndex + 1) % 4),
      awayGoals: String((groupIndex + matchIndex) % 3),
    })),
  }));
}

describe("tournament.ts", () => {
  describe("calculateTable", () => {
    it("räknar ut tabellen korrekt", () => {
      const teams = ["Alpha", "Bravo", "Charlie", "Delta"];

      const matches: Match[] = [
        {
          id: 1,
          matchNumber: 1,
          date: "2026-01-01",
          time: "18:00",
          homeTeam: "Alpha",
          awayTeam: "Bravo",
          homeGoals: "2",
          awayGoals: "0",
        },
        {
          id: 2,
          matchNumber: 2,
          date: "2026-01-01",
          time: "21:00",
          homeTeam: "Charlie",
          awayTeam: "Delta",
          homeGoals: "1",
          awayGoals: "1",
        },
        {
          id: 3,
          matchNumber: 3,
          date: "2026-01-02",
          time: "18:00",
          homeTeam: "Alpha",
          awayTeam: "Charlie",
          homeGoals: "1",
          awayGoals: "0",
        },
        {
          id: 4,
          matchNumber: 4,
          date: "2026-01-02",
          time: "21:00",
          homeTeam: "Bravo",
          awayTeam: "Delta",
          homeGoals: "3",
          awayGoals: "1",
        },
        {
          id: 5,
          matchNumber: 5,
          date: "2026-01-03",
          time: "18:00",
          homeTeam: "Alpha",
          awayTeam: "Delta",
          homeGoals: "0",
          awayGoals: "0",
        },
        {
          id: 6,
          matchNumber: 6,
          date: "2026-01-03",
          time: "21:00",
          homeTeam: "Bravo",
          awayTeam: "Charlie",
          homeGoals: "1",
          awayGoals: "2",
        },
      ];

      const table = calculateTable(teams, matches);

      expect(table).toHaveLength(4);

      expect(table[0].team).toBe("Alpha");
      expect(table[0].points).toBe(7);
      expect(table[0].goalDiff).toBe(3);

      expect(table[1].team).toBe("Charlie");
      expect(table[1].points).toBe(4);

      expect(table[2].team).toBe("Bravo");
      expect(table[2].points).toBe(3);

      expect(table[3].team).toBe("Delta");
      expect(table[3].points).toBe(2);
    });

    it("använder målskillnad som tiebreaker", () => {
      const teams = ["Red", "Blue", "Green", "Yellow"];

      const matches: Match[] = [
        {
          id: 1,
          matchNumber: 1,
          date: "2026-01-01",
          time: "18:00",
          homeTeam: "Red",
          awayTeam: "Blue",
          homeGoals: "2",
          awayGoals: "0",
        },
        {
          id: 2,
          matchNumber: 2,
          date: "2026-01-01",
          time: "21:00",
          homeTeam: "Green",
          awayTeam: "Yellow",
          homeGoals: "1",
          awayGoals: "0",
        },
        {
          id: 3,
          matchNumber: 3,
          date: "2026-01-02",
          time: "18:00",
          homeTeam: "Red",
          awayTeam: "Green",
          homeGoals: "0",
          awayGoals: "1",
        },
        {
          id: 4,
          matchNumber: 4,
          date: "2026-01-02",
          time: "21:00",
          homeTeam: "Blue",
          awayTeam: "Yellow",
          homeGoals: "2",
          awayGoals: "0",
        },
        {
          id: 5,
          matchNumber: 5,
          date: "2026-01-03",
          time: "18:00",
          homeTeam: "Red",
          awayTeam: "Yellow",
          homeGoals: "3",
          awayGoals: "0",
        },
        {
          id: 6,
          matchNumber: 6,
          date: "2026-01-03",
          time: "21:00",
          homeTeam: "Blue",
          awayTeam: "Green",
          homeGoals: "1",
          awayGoals: "0",
        },
      ];

      const table = calculateTable(teams, matches);

      const red = table.find((row) => row.team === "Red");
      const blue = table.find((row) => row.team === "Blue");

      expect(red).toBeDefined();
      expect(blue).toBeDefined();

      expect(red?.points).toBe(6);
      expect(blue?.points).toBe(6);
      expect((red?.goalDiff ?? 0) > (blue?.goalDiff ?? 0)).toBe(true);

      expect(table[0].team).toBe("Red");
      expect(table[1].team).toBe("Blue");
    });

    it("ignorerar matcher utan ifyllda resultat", () => {
      const teams = ["A", "B", "C", "D"];

      const matches: Match[] = [
        {
          id: 1,
          matchNumber: 1,
          date: "2026-01-01",
          time: "18:00",
          homeTeam: "A",
          awayTeam: "B",
          homeGoals: "2",
          awayGoals: "1",
        },
        {
          id: 2,
          matchNumber: 2,
          date: "2026-01-01",
          time: "21:00",
          homeTeam: "C",
          awayTeam: "D",
          homeGoals: "",
          awayGoals: "",
        },
      ];

      const table = calculateTable(teams, matches);

      const a = table.find((row) => row.team === "A");
      const b = table.find((row) => row.team === "B");
      const c = table.find((row) => row.team === "C");
      const d = table.find((row) => row.team === "D");

      expect(a?.played).toBe(1);
      expect(a?.points).toBe(3);

      expect(b?.played).toBe(1);
      expect(b?.points).toBe(0);

      expect(c?.played).toBe(0);
      expect(c?.points).toBe(0);

      expect(d?.played).toBe(0);
      expect(d?.points).toBe(0);
    });
  });

  describe("isGroupComplete", () => {
    it("returnerar false om en grupp har tomma resultat", () => {
      const group: GroupData = {
        name: "Grupp X",
        teams: ["A", "B", "C", "D"],
        matches: [
          {
            id: 1,
            matchNumber: 1,
            date: "2026-01-01",
            time: "18:00",
            homeTeam: "A",
            awayTeam: "B",
            homeGoals: "1",
            awayGoals: "0",
          },
          {
            id: 2,
            matchNumber: 2,
            date: "2026-01-01",
            time: "21:00",
            homeTeam: "C",
            awayTeam: "D",
            homeGoals: "",
            awayGoals: "",
          },
        ],
      };

      expect(isGroupComplete(group)).toBe(false);
    });

    it("returnerar true om alla matcher i gruppen har resultat", () => {
      const group: GroupData = {
        name: "Grupp X",
        teams: ["A", "B", "C", "D"],
        matches: [
          {
            id: 1,
            matchNumber: 1,
            date: "2026-01-01",
            time: "18:00",
            homeTeam: "A",
            awayTeam: "B",
            homeGoals: "1",
            awayGoals: "0",
          },
          {
            id: 2,
            matchNumber: 2,
            date: "2026-01-01",
            time: "21:00",
            homeTeam: "C",
            awayTeam: "D",
            homeGoals: "2",
            awayGoals: "2",
          },
        ],
      };

      expect(isGroupComplete(group)).toBe(true);
    });
  });

  describe("isTournamentGroupStageComplete", () => {
    it("returnerar false för initialGroups", () => {
      const groups = cloneGroups();
      expect(isTournamentGroupStageComplete(groups)).toBe(false);
    });

    it("returnerar true när alla gruppmatcher har resultat", () => {
      const groups = fillAllMatches(cloneGroups());
      expect(isTournamentGroupStageComplete(groups)).toBe(true);
    });
  });

  describe("getBestThirds", () => {
    it("returnerar alla grupptreor och markerar 8 som kvalificerade", () => {
      const groups = fillAllMatches(cloneGroups());
      const thirds = getBestThirds(groups);

      expect(thirds).toHaveLength(12);

      const qualified = thirds.filter((team) => team.isQualified);
      expect(qualified).toHaveLength(8);

      for (let i = 0; i < thirds.length - 1; i += 1) {
        const current = thirds[i];
        const next = thirds[i + 1];

        if (current.points !== next.points) {
          expect(current.points).toBeGreaterThanOrEqual(next.points);
          continue;
        }

        if (current.goalDiff !== next.goalDiff) {
          expect(current.goalDiff).toBeGreaterThanOrEqual(next.goalDiff);
          continue;
        }

        if (current.goalsFor !== next.goalsFor) {
          expect(current.goalsFor).toBeGreaterThanOrEqual(next.goalsFor);
        }
      }
    });
  });

  describe("getKnockoutSeedData", () => {
    it("bygger 16 matcher i round32", () => {
      const groups = fillAllMatches(cloneGroups());
      const { round32 } = getKnockoutSeedData(groups);

      expect(round32).toHaveLength(16);
    });

    it("använder rätt match-id i round32", () => {
      const groups = fillAllMatches(cloneGroups());
      const { round32 } = getKnockoutSeedData(groups);

      const ids = round32.map((match) => match.id);

      expect(ids).toEqual([
        "m74",
        "m77",
        "m73",
        "m75",
        "m83",
        "m84",
        "m81",
        "m82",
        "m76",
        "m78",
        "m79",
        "m80",
        "m86",
        "m88",
        "m85",
        "m87",
      ]);
    });

    it("fyller round32 med lag", () => {
      const groups = fillAllMatches(cloneGroups());
      const { round32 } = getKnockoutSeedData(groups);

      for (const match of round32) {
        expect(match.home).not.toBe("");
        expect(match.away).not.toBe("");
      }
    });
  });

  describe("buildRoundFromPairs", () => {
    it("bygger nästa runda från definierade beroenden", () => {
      const definitions = [
        {
          id: "m89",
          label: "Match 89",
          homeFrom: "m74",
          awayFrom: "m77",
        },
        {
          id: "m90",
          label: "Match 90",
          homeFrom: "m73",
          awayFrom: "m75",
        },
      ];

      const selectedWinners = {
        m74: "Spanien",
        m77: "Frankrike",
        m73: "Brasilien",
        m75: "Japan",
      };

      const round = buildRoundFromPairs(definitions, selectedWinners);

      expect(round).toEqual<KnockoutMatch[]>([
        {
          id: "m89",
          label: "Match 89",
          home: "Spanien",
          away: "Frankrike",
        },
        {
          id: "m90",
          label: "Match 90",
          home: "Brasilien",
          away: "Japan",
        },
      ]);
    });
  });

  describe("getLoser", () => {
    it("returnerar förloraren när home vinner", () => {
      const match: KnockoutMatch = {
        id: "m101",
        label: "Semi 1",
        home: "Spanien",
        away: "Frankrike",
      };

      const selectedWinners = {
        m101: "Spanien",
      };

      expect(getLoser(match, selectedWinners)).toBe("Frankrike");
    });

    it("returnerar förloraren när away vinner", () => {
      const match: KnockoutMatch = {
        id: "m102",
        label: "Semi 2",
        home: "Brasilien",
        away: "Argentina",
      };

      const selectedWinners = {
        m102: "Argentina",
      };

      expect(getLoser(match, selectedWinners)).toBe("Brasilien");
    });

    it("returnerar tom sträng om ingen vinnare är vald", () => {
      const match: KnockoutMatch = {
        id: "m102",
        label: "Semi 2",
        home: "Brasilien",
        away: "Argentina",
      };

      expect(getLoser(match, {})).toBe("");
    });
  });

  describe("clearDependentKnockoutSelections", () => {
    it("rensar downstream-val från en round32-match", () => {
      const winners = {
        m74: "Spanien",
        m77: "Frankrike",
        m89: "Spanien",
        m97: "Spanien",
        m101: "Spanien",
        m104: "Spanien",
        m103: "Frankrike",
      };

      const cleared = clearDependentKnockoutSelections(winners, "m74");

      expect(cleared.m74).toBe("Spanien");
      expect(cleared.m77).toBe("Frankrike");

      expect(cleared.m89).toBeUndefined();
      expect(cleared.m97).toBeUndefined();
      expect(cleared.m101).toBeUndefined();
      expect(cleared.m104).toBeUndefined();
      expect(cleared.m103).toBeUndefined();
    });

    it("rensar downstream-val från en kvartsfinal", () => {
      const winners = {
        m97: "Spanien",
        m98: "Brasilien",
        m101: "Spanien",
        m104: "Spanien",
        m103: "Brasilien",
      };

      const cleared = clearDependentKnockoutSelections(winners, "m97");

      expect(cleared.m97).toBe("Spanien");
      expect(cleared.m98).toBe("Brasilien");

      expect(cleared.m101).toBeUndefined();
      expect(cleared.m104).toBeUndefined();
      expect(cleared.m103).toBeUndefined();
    });

    it("gör inget om changedMatchId inte finns i dependencyMap", () => {
      const winners = {
        m74: "Spanien",
        m89: "Spanien",
        m97: "Spanien",
      };

      const cleared = clearDependentKnockoutSelections(winners, "okänd-match");

      expect(cleared).toEqual(winners);
    });
  });
});