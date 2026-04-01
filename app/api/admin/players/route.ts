import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401, error: "Ej inloggad", supabase };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    return {
      ok: false as const,
      status: 403,
      error: "Ingen behörighet",
      supabase,
    };
  }

  return { ok: true as const, supabase };
}

export async function POST(req: Request) {
  const auth = await checkAdmin();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();

  const { data, error } = await auth.supabase
    .from("team_players")
    .insert({
      team_id: body.team_id,
      name: body.name,
      position: body.position,
      club: body.club,
      age: body.age,
      caps: body.caps,
      goals: body.goals,
      shirt_number: body.shirt_number,
      is_key_player: body.is_key_player,
      is_injured: body.is_injured,
      player_order: body.player_order,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, player: data });
}