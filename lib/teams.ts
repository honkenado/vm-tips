import { createReadOnlyClient } from "@/lib/supabase/server-readonly";
import {
  getAllStaticTeamProfiles,
  getStaticTeamsGroupedByLetter,
} from "@/lib/teams-static";
import type {
  QualificationEntry,
  TeamLineup,
  TeamPlayer,
  TeamProfile,
} from "@/types/team";

type TeamRow = {
  id: string;
  name: string;
  slug: string;
  group_letter: string;
  fifa_rank: number | null;
  coach: string | null;
  confederation: string | null;
  wikipedia_title: string | null;
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

type TeamLineupRow = {
  id: string;
  team_id: string;
  lineup_name: string;
  formation: string;
};

type TeamLineupSlotRow = {
  id: string;
  lineup_id: string;
  slot_key: string;
  role_label: string;
  x_pos: number | string;
  y_pos: number | string;
  player_id: string | null;
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

function buildLineup(
  lineupRow: TeamLineupRow | null,
  slotRows: TeamLineupSlotRow[],
  squad: TeamPlayer[]
): TeamLineup | null {
  if (!lineupRow) return null;

  const squadMap = new Map(
    squad.map((player) => [
      player.id,
      {
        id: player.id,
        name: player.name,
        shirtNumber: player.shirtNumber ?? null,
      },
    ])
  );

  return {
    id: lineupRow.id,
    formation: lineupRow.formation,
    lineupName: lineupRow.lineup_name,
    slots: slotRows.map((slot) => ({
      id: slot.id,
      slotKey: slot.slot_key,
      roleLabel: slot.role_label,
      xPos: Number(slot.x_pos),
      yPos: Number(slot.y_pos),
      playerId: slot.player_id,
      player: slot.player_id ? squadMap.get(slot.player_id) ?? null : null,
    })),
  };
}

function buildTeamProfile(
  team: TeamRow,
  players: TeamPlayerRow[],
  qualification: QualificationRow[],
  lineup: TeamLineup | null = null
): TeamProfile {
  const mappedSquad = players
    .sort((a, b) => a.name.localeCompare(b.name, "sv"))
    .map(mapPlayer);

  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    groupLetter: team.group_letter,
    fifaRank: team.fifa_rank ?? undefined,
    coach: team.coach ?? undefined,
    confederation: team.confederation ?? undefined,
    wikipediaTitle: team.wikipedia_title ?? undefined,
    shortDescription: team.short_description ?? "",
    qualificationSummary: team.qualification_summary ?? "",
    squadStatus: team.squad_status ?? undefined,
    source: team.source ?? undefined,
    updatedAt: team.updated_at ?? undefined,
    squad: mappedSquad,
    qualificationPath: qualification
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(mapQualification),
    lineup,
  };
}

export async function getAllTeamProfiles(): Promise<TeamProfile[]> {
  try {
    const supabase = createReadOnlyClient();

    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("*")
      .order("group_letter", { ascending: true })
      .order("name", { ascending: true });

    if (teamsError) {
      console.error("[teams] getAllTeamProfiles teamsError:", teamsError);
      return getAllStaticTeamProfiles();
    }

    if (!teams || teams.length === 0) {
      console.log("[teams] getAllTeamProfiles: inga lag i DB, fallback används");
      return getAllStaticTeamProfiles();
    }

    const teamIds = teams.map((team) => team.id);

    const [
      { data: players, error: playersError },
      { data: qualification, error: qualificationError },
    ] = await Promise.all([
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

    if (playersError) {
      console.error("[teams] getAllTeamProfiles playersError:", playersError);
    }

    if (qualificationError) {
      console.error(
        "[teams] getAllTeamProfiles qualificationError:",
        qualificationError
      );
    }

    return (teams as TeamRow[]).map((team) =>
      buildTeamProfile(
        team,
        ((players ?? []) as TeamPlayerRow[]).filter((p) => p.team_id === team.id),
        ((qualification ?? []) as QualificationRow[]).filter(
          (q) => q.team_id === team.id
        ),
        null
      )
    );
  } catch (error) {
    console.error("[teams] getAllTeamProfiles exception:", error);
    return getAllStaticTeamProfiles();
  }
}

export async function getTeamsGroupedByLetter(): Promise<Record<string, TeamProfile[]>> {
  try {
    const teams = await getAllTeamProfiles();

    return teams.reduce<Record<string, TeamProfile[]>>((acc, team) => {
      if (!acc[team.groupLetter]) {
        acc[team.groupLetter] = [];
      }

      acc[team.groupLetter].push(team);
      acc[team.groupLetter].sort((a, b) => a.name.localeCompare(b.name, "sv"));

      return acc;
    }, {});
  } catch (error) {
    console.error("[teams] getTeamsGroupedByLetter exception:", error);
    return getStaticTeamsGroupedByLetter();
  }
}

export async function getTeamBySlug(slug: string): Promise<TeamProfile | null> {
  const supabase = createReadOnlyClient();

  const { data: team, error } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  console.log("[teams] getTeamBySlug slug:", slug);
  console.log("[teams] getTeamBySlug team:", team);
  console.log("[teams] getTeamBySlug error:", error);

  if (error) {
    throw new Error(`[teams] Supabase team error: ${error.message}`);
  }

  if (!team) {
    throw new Error(`[teams] No team found in Supabase for slug: ${slug}`);
  }

  const [
    { data: players, error: playersError },
    { data: qualification, error: qualificationError },
    { data: lineupRow, error: lineupError },
  ] = await Promise.all([
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
    supabase
      .from("team_lineups")
      .select("id, team_id, lineup_name, formation")
      .eq("team_id", team.id)
      .eq("lineup_name", "Startelva")
      .maybeSingle(),
  ]);

  console.log("[teams] getTeamBySlug players:", players);
  console.log("[teams] getTeamBySlug playersError:", playersError);
  console.log("[teams] getTeamBySlug qualification:", qualification);
  console.log("[teams] getTeamBySlug qualificationError:", qualificationError);
  console.log("[teams] getTeamBySlug lineupRow:", lineupRow);
  console.log("[teams] getTeamBySlug lineupError:", lineupError);

  if (playersError) {
    throw new Error(`[teams] Supabase players error: ${playersError.message}`);
  }

  if (qualificationError) {
    throw new Error(
      `[teams] Supabase qualification error: ${qualificationError.message}`
    );
  }

  if (lineupError) {
    throw new Error(`[teams] Supabase lineup error: ${lineupError.message}`);
  }

  let lineup: TeamLineup | null = null;

  if (lineupRow) {
    const { data: slotRows, error: slotsError } = await supabase
      .from("team_lineup_slots")
      .select("id, lineup_id, slot_key, role_label, x_pos, y_pos, player_id")
      .eq("lineup_id", lineupRow.id);

    console.log("[teams] getTeamBySlug slotRows:", slotRows);
    console.log("[teams] getTeamBySlug slotsError:", slotsError);

    if (slotsError) {
      throw new Error(`[teams] Supabase lineup slots error: ${slotsError.message}`);
    }

    const mappedSquad = ((players ?? []) as TeamPlayerRow[])
      .sort((a, b) => a.name.localeCompare(b.name, "sv"))
      .map(mapPlayer);

    lineup = buildLineup(
      lineupRow as TeamLineupRow,
      (slotRows ?? []) as TeamLineupSlotRow[],
      mappedSquad
    );
  }

  return buildTeamProfile(
    team as TeamRow,
    (players ?? []) as TeamPlayerRow[],
    (qualification ?? []) as QualificationRow[],
    lineup
  );
}