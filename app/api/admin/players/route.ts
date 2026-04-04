import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { team_id, name, position, club } = body;

    if (!team_id || !name || !position) {
      return NextResponse.json(
        { error: "team_id, name och position krävs" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("team_players")
      .insert({
        team_id,
        name,
        position,
        club: club || null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, player: data });
  } catch {
    return NextResponse.json(
      { error: "Något gick fel när spelaren skulle sparas" },
      { status: 500 }
    );
  }
}