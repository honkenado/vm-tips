// lib/teams.ts

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

type TeamSeedData = Omit<TeamProfile, "groupLetter">;

const teamSeedData: Record<string, TeamSeedData> = {
  Sverige: {
    name: "Sverige",
    slug: "sverige",
    fifaRank: 38,
    coach: "Förbundskapten saknas",
    confederation: "UEFA",
    shortDescription:
      "Sverige är ett klassiskt europeiskt landslag med stark turneringstradition och fysisk, organiserad fotboll.",
    qualificationSummary:
      "Kvalificeringsväg läggs till senare.",
    squad: [],
    qualificationPath: [],
  },
  Spanien: {
    name: "Spanien",
    slug: "spanien",
    fifaRank: 2,
    coach: "Förbundskapten saknas",
    confederation: "UEFA",
    shortDescription:
      "Spanien är ett tekniskt topplag med starkt bollinnehav och hög internationell status.",
    qualificationSummary:
      "Kvalificeringsväg läggs till senare.",
    squad: [],
    qualificationPath: [],
  },
  Argentina: {
    name: "Argentina",
    slug: "argentina",
    fifaRank: 3,
    coach: "Förbundskapten saknas",
    confederation: "CONMEBOL",
    shortDescription:
      "Argentina tillhör världseliten och kombinerar individuell spets med hög tävlingsvana.",
    qualificationSummary:
      "Kvalificeringsväg läggs till senare.",
    squad: [],
    qualificationPath: [],
  },
};

function getAllTeamsFromGroups() {
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
        shortDescription:
          seeded?.shortDescription ??
          `${teamName} spelar i Grupp ${groupLetter} i Addes VM-tips.`,
        qualificationSummary:
          seeded?.qualificationSummary ?? "Kvalificeringsväg läggs till senare.",
        squad: seeded?.squad ?? [],
        qualificationPath: seeded?.qualificationPath ?? [],
      };
    });
  });
}

export function getAllTeamProfiles() {
  return getAllTeamsFromGroups().sort((a, b) => a.name.localeCompare(b.name, "sv"));
}

export function getTeamsGroupedByLetter() {
  const allTeams = getAllTeamsFromGroups();

  return allTeams.reduce<Record<string, TeamProfile[]>>((acc, team) => {
    if (!acc[team.groupLetter]) acc[team.groupLetter] = [];
    acc[team.groupLetter].push(team);
    acc[team.groupLetter].sort((a, b) => a.name.localeCompare(b.name, "sv"));
    return acc;
  }, {});
}

export function getTeamBySlug(slug: string) {
  return getAllTeamsFromGroups().find((team) => team.slug === slug) ?? null;
}