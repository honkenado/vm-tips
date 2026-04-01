// lib/teams.ts

import { createClient } from "@/lib/supabase/server";
import {
  getAllStaticTeamProfiles,
  getStaticTeamBySlug,
  getStaticTeamsGroupedByLetter,
} from "@/lib/teams-static";
import type { QualificationEntry, TeamPlayer, TeamProfile } from "@/types/team";

type TeamRow = {
  id: string;
  name: string;
  slug: string;
  group_letter: string;
  fifa_rank: number | null;
  coach: string | null;
  confederation: string | null;
  short_description: string | null;
  qualification_summary: string | null;
  squad_status: string | null;
  source: string | null;
  updated_at: string | null;
};

type TeamPlayerRow = {
  id: string;
  team_id: string;
  name: string;
  position: string;
  club: string | null;
  age: number | null;
  caps: number | null;
  goals: number | null;
  shirt_number: number | null;
  squad_status: string | null;
  source: string | null;
  updated_at: string | null;
};

type QualificationRow = {
  id: string;
  team_id: string;
  label: string;
  opponent: string | null;
  result: string | null;
  match_date: string | null;
  note: string | null;
  sort_order: number | null;
};

function mapPlayer(row: TeamPlayerRow): TeamPlayer {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    club: row.club ?? undefined,
    age: row.age ?? undefined,
    caps: row.caps ?? undefined,
    goals: row.goals ?? undefined,
    shirtNumber: row.shirt_number ?? undefined,
    squadStatus: row.squad_status ?? undefined,
    source: row.source ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

function mapQualification(row: QualificationRow): QualificationEntry {
  return {
    id: row.id,
    label: row.label,
    opponent: row.opponent ?? undefined,
    result: row.result ?? undefined,
    date: row.match_date ?? undefined,
    note: row.note ?? undefined,
    sortOrder: row.sort_order ?? undefined,
  };
}

function buildTeamProfile(
  team: TeamRow,
  players: TeamPlayerRow[],
  qualification: QualificationRow[]
): TeamProfile {
  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    groupLetter: team.group_letter,
    fifaRank: team.fifa_rank ?? undefined,
    coach: team.coach ?? undefined,
    confederation: team.confederation ?? undefined,
    shortDescription: team.short_description ?? "",
    qualificationSummary: team.qualification_summary ?? "",
    squadStatus: team.squad_status ?? undefined,
    source: team.source ?? undefined,
    updatedAt: team.updated_at ?? undefined,
    squad: players.map(mapPlayer),
    qualificationPath: qualification
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(mapQualification),
  };
}

export async function getAllTeamProfiles(): Promise<TeamProfile[]> {
  try {
    const supabase = await createClient();

    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("*")
      .order("group_letter", { ascending: true })
      .order("name", { ascending: true });

    if (teamsError || !teams || teams.length === 0) {
      return getAllStaticTeamProfiles();
    }

    const teamIds = teams.map((team) => team.id);

    const [{ data: players }, { data: qualification }] = await Promise.all([
      supabase
        .from("team_players")
        .select("*")
        .in("team_id", teamIds)
        .order("name", { ascending: true }),
      supabase
        .from("team_qualification_path")
        .select("*")
        .in("team_id", teamIds)
        .order("sort_order", { ascending: true }),
    ]);

    return (teams as TeamRow[]).map((team) =>
      buildTeamProfile(
        team,
        ((players ?? []) as TeamPlayerRow[]).filter((p) => p.team_id === team.id),
        ((qualification ?? []) as QualificationRow[]).filter(
          (q) => q.team_id === team.id
        )
      )
    );
  } catch (error) {
    console.error("Kunde inte hämta lag från Supabase", error);
    return getAllStaticTeamProfiles();
  }
}

export async function getTeamsGroupedByLetter(): Promise<Record<string, TeamProfile[]>> {
  try {
    const teams = await getAllTeamProfiles();

    return teams.reduce<Record<string, TeamProfile[]>>((acc, team) => {
      if (!acc[team.groupLetter]) acc[team.groupLetter] = [];
      acc[team.groupLetter].push(team);
      acc[team.groupLetter].sort((a, b) => a.name.localeCompare(b.name, "sv"));
      return acc;
    }, {});
  } catch (error) {
    console.error("Kunde inte gruppera lag", error);
    return getStaticTeamsGroupedByLetter();
  }
}

export async function getTeamBySlug(slug: string): Promise<TeamProfile | null> {
  try {
    const supabase = await createClient();

    const { data: team, error } = await supabase
      .from("teams")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !team) {
      return getStaticTeamBySlug(slug);
    }

    const [{ data: players }, { data: qualification }] = await Promise.all([
      supabase
        .from("team_players")
        .select("*")
        .eq("team_id", team.id)
        .order("name", { ascending: true }),
      supabase
        .from("team_qualification_path")
        .select("*")
        .eq("team_id", team.id)
        .order("sort_order", { ascending: true }),
    ]);

    return buildTeamProfile(
      team as TeamRow,
      (players ?? []) as TeamPlayerRow[],
      (qualification ?? []) as QualificationRow[]
    );
  } catch (error) {
    console.error(`Kunde inte hämta lag med slug ${slug}`, error);
    return getStaticTeamBySlug(slug);
  }
}