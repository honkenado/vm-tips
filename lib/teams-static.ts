// lib/teams-static.ts

import { initialGroups } from "@/lib/tournament";
import type { TeamProfile } from "@/types/team";

function slugifyTeamName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type TeamSeedData = Omit<TeamProfile, "groupLetter" | "id" | "updatedAt">;

export const teamSeedData: Record<string, TeamSeedData> = {
  Sverige: {
    name: "Sverige",
    slug: "sverige",
    fifaRank: 42,
    coach: "Graham Potter",
    confederation: "UEFA",
    shortDescription:
      "Sverige är ett fysiskt starkt och välorganiserat landslag med tydlig struktur, stark omställningsfotboll och flera spelare på hög internationell nivå.",
    qualificationSummary:
      "Sverige tog sig vidare via playoff och har nu VM i Nordamerika framför sig.",
    squadStatus: "preliminär",
    source: "statisk fallback",
    qualificationPath: [
      {
        id: "swe-q1",
        label: "Playoff-semifinal",
        opponent: "Ukraina",
        date: "26 mars 2026",
        note: "Truppen presenterades inför playoff-semifinalen.",
        sortOrder: 1,
      },
      {
        id: "swe-q2",
        label: "Avgörande playoffmatch",
        opponent: "Polen/Albanien",
        date: "31 mars 2026",
        note: "Vid seger väntade avgörande playoffmatch.",
        sortOrder: 2,
      },
    ],
    squad: [
      {
        id: "swe-melker-ellborg",
        name: "Melker Ellborg",
        position: "Målvakt",
        club: "Sunderland AFC",
      },
      {
        id: "swe-kristoffer-nordfeldt",
        name: "Kristoffer Nordfeldt",
        position: "Målvakt",
        club: "AIK Fotboll AB",
        caps: 20,
        goals: 0,
      },
      {
        id: "swe-noel-tornqvist",
        name: "Noel Törnqvist",
        position: "Målvakt",
        club: "COMO 1907 S.R.L.",
      },
    ],
  },
};

function getAllTeamsFromGroups(): TeamProfile[] {
  return initialGroups.flatMap((group) => {
    const groupLetter = group.name.replace("Grupp ", "").trim();

    return group.teams.map((teamName) => {
      const seeded = teamSeedData[teamName];

      return {
        name: teamName,
        slug: seeded?.slug ?? slugifyTeamName(teamName),
        groupLetter,
        fifaRank: seeded?.fifaRank,
        coach: seeded?.coach,
        confederation: seeded?.confederation,
        shortDescription: seeded?.shortDescription ?? "",
        qualificationSummary:
          seeded?.qualificationSummary ?? "Kvalificeringsväg läggs till senare.",
        squadStatus: seeded?.squadStatus ?? "unknown",
        source: seeded?.source ?? "statisk fallback",
        squad: seeded?.squad ?? [],
        qualificationPath: seeded?.qualificationPath ?? [],
      };
    });
  });
}

export function getAllStaticTeamProfiles() {
  return getAllTeamsFromGroups().sort((a, b) => a.name.localeCompare(b.name, "sv"));
}

export function getStaticTeamsGroupedByLetter() {
  const allTeams = getAllTeamsFromGroups();

  return allTeams.reduce<Record<string, TeamProfile[]>>((acc, team) => {
    if (!acc[team.groupLetter]) acc[team.groupLetter] = [];
    acc[team.groupLetter].push(team);
    acc[team.groupLetter].sort((a, b) => a.name.localeCompare(b.name, "sv"));
    return acc;
  }, {});
}

export function getStaticTeamBySlug(slug: string) {
  return getAllTeamsFromGroups().find((team) => team.slug === slug) ?? null;
}