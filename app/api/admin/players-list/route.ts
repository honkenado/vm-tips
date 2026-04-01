import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json({ error: "teamId saknas" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_players")
    .select("id, team_id, name, position, club")
    .eq("team_id", teamId)
    .order("player_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ players: data ?? [] });
}