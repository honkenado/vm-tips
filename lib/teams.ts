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
  fifaRank: 42,
  coach: "Graham Potter",
  confederation: "UEFA",
  shortDescription:
    "Sverige är ett fysiskt starkt och välorganiserat landslag med tydlig struktur, stark omställningsfotboll och flera spelare på hög internationell nivå.",
  qualificationSummary:
    "Sverige tog sig vidare via playoff och har nu VM i Nordamerika framför sig.",
  qualificationPath: [
    {
      id: "swe-q1",
      label: "Playoff-semifinal",
      opponent: "Ukraina",
      date: "26 mars 2026",
      note: "SvFF presenterade truppen inför playoff-semifinalen mot Ukraina.",
    },
    {
      id: "swe-q2",
      label: "Avgörande playoffmatch",
      opponent: "Polen/Albanien",
      date: "31 mars 2026",
      note: "Vid seger mot Ukraina väntade en direkt avgörande kvalfinal hemma på Strawberry Arena.",
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
    {
      id: "swe-victor-eriksson",
      name: "Victor Eriksson",
      position: "Back",
      club: "Hammarby Fotboll AB",
      caps: 1,
      goals: 0,
    },
    {
      id: "swe-gabriel-gudmundsson",
      name: "Gabriel Gudmundsson",
      position: "Back",
      club: "Leeds United",
      caps: 23,
      goals: 0,
    },
    {
      id: "swe-isak-hien",
      name: "Isak Hien",
      position: "Back",
      club: "Atalanta BC",
      caps: 27,
      goals: 0,
    },
    {
      id: "swe-herman-johansson",
      name: "Herman Johansson",
      position: "Back",
      club: "FC Dallas",
      caps: 2,
      goals: 0,
    },
    {
      id: "swe-gustaf-lagerbielke",
      name: "Gustaf Lagerbielke",
      position: "Back",
      club: "S.C Braga",
      caps: 9,
      goals: 2,
    },
    {
      id: "swe-victor-nilsson-lindelof",
      name: "Victor Nilsson Lindelöf",
      position: "Back",
      club: "Aston Villa",
      caps: 75,
      goals: 3,
    },
    {
      id: "swe-carl-starfelt",
      name: "Carl Starfelt",
      position: "Back",
      club: "RC Celta de Vigo",
      caps: 17,
      goals: 0,
    },
    {
      id: "swe-elliot-stroud",
      name: "Elliot Stroud",
      position: "Back",
      club: "Mjällby AIF",
    },
    {
      id: "swe-daniel-svensson",
      name: "Daniel Svensson",
      position: "Back",
      club: "Borrussia Dortmund",
      caps: 11,
      goals: 0,
    },
    {
      id: "swe-taha-abdi-ali",
      name: "Taha Abdi Ali",
      position: "Mittfältare",
      club: "Malmö FF",
      caps: 1,
      goals: 0,
    },
    {
      id: "swe-yasin-ayari",
      name: "Yasin Ayari",
      position: "Mittfältare",
      club: "Brighton & Hove Albion",
      caps: 19,
      goals: 3,
    },
    {
      id: "swe-roony-bardghji",
      name: "Roony Bardghji",
      position: "Mittfältare",
      club: "FC Barcelona",
      caps: 3,
      goals: 0,
    },
    {
      id: "swe-lucas-bergvall",
      name: "Lucas Bergvall",
      position: "Mittfältare",
      club: "Tottenham Hotspur FC",
      caps: 8,
      goals: 0,
    },
    {
      id: "swe-anthony-elanga",
      name: "Anthony Elanga",
      position: "Anfallare",
      club: "Newcastle United FC",
      caps: 28,
      goals: 6,
    },
    {
      id: "swe-viktor-gyokeres",
      name: "Viktor Gyökeres",
      position: "Anfallare",
      club: "Arsenal FC",
      caps: 32,
      goals: 19,
    },
    {
      id: "swe-jesper-karlstrom",
      name: "Jesper Karlström",
      position: "Mittfältare",
      club: "Udinese Calcio",
      caps: 23,
      goals: 0,
    },
    {
      id: "swe-hugo-larsson",
      name: "Hugo Larsson",
      position: "Mittfältare",
      club: "Eintracht Frankfurt",
      caps: 12,
      goals: 0,
    },
    {
      id: "swe-gustav-lundgren",
      name: "Gustav Lundgren",
      position: "Mittfältare",
      club: "GAIS",
      caps: 2,
      goals: 1,
    },
    {
      id: "swe-gustaf-nilsson",
      name: "Gustaf Nilsson",
      position: "Anfallare",
      club: "Club Brugge",
      caps: 8,
      goals: 3,
    },
    {
      id: "swe-benjamin-nygren",
      name: "Benjamin Nygren",
      position: "Anfallare",
      club: "Celtic FC",
      caps: 9,
      goals: 3,
    },
    {
      id: "swe-eric-smith",
      name: "Eric Smith",
      position: "Mittfältare",
      club: "FC St Pauli",
    },
    {
      id: "swe-mattias-svanberg",
      name: "Mattias Svanberg",
      position: "Mittfältare",
      club: "VfL Wolfsburg",
      caps: 39,
      goals: 2,
    },
    {
      id: "swe-williot-swedberg",
      name: "Williot Swedberg",
      position: "Anfallare",
      club: "RC Celta de Vigo",
      caps: 1,
      goals: 0,
    },
    {
      id: "swe-besfort-zeneli",
      name: "Besfort Zeneli",
      position: "Mittfältare",
      club: "R. UNION ST-GILLOISE",
      caps: 6,
      goals: 0,
    },
  ],
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
        shortDescription: seeded?.shortDescription ?? "",
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