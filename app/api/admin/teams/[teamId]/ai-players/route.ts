import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Hämta lag
  const { data: team } = await supabase
    .from("teams")
    .select("id, name")
    .eq("id", id)
    .single();

  if (!team) {
    return NextResponse.json({ error: "Lag saknas" }, { status: 404 });
  }

  // ⚡ Fake AI (vi börjar här så allt funkar)
  const players = [
    { name: "Player 1", position: "GK" },
    { name: "Player 2", position: "DF" },
    { name: "Player 3", position: "MF" },
    { name: "Player 4", position: "FW" },
  ];

  // Spara i DB
  const inserts = players.map((p, index) => ({
    team_id: id,
    name: p.name,
    position: p.position,
    player_order: index,
  }));

  const { error } = await supabase
    .from("team_players")
    .insert(inserts);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, count: players.length });
}