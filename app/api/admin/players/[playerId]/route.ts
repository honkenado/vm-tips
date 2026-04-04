import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ playerId: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  const { playerId } = await context.params;
  const supabase = await createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("team_players")
    .update({
      name: body.name,
      position: body.position,
      club: body.club,
    })
    .eq("id", playerId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, player: data });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { playerId } = await context.params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("team_players")
    .delete()
    .eq("id", playerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}