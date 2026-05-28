import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  let query = supabase
    .from("team_players")
    .select(`
      id,
      name,
      position,
      club,
      team:teams (
        id,
        name
      )
    `);

  if (q.length >= 2) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error } = await query
    .order("name", { ascending: true })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const options = (data ?? []).map((player: any) => ({
    id: player.id,
    name: player.name,
    position: player.position,
    club: player.club,
    teamId: player.team?.id ?? null,
    teamName: player.team?.name ?? "",
  }));

  return NextResponse.json({ options });
}