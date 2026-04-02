import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { teamId: string } }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_lineups")
    .select("*")
    .eq("team_id", params.teamId)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    lineup: data ?? null,
  });
}

export async function POST(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  const supabase = await createClient();
  const body = await req.json();

  const { positions } = body;

  if (!positions) {
    return NextResponse.json(
      { error: "Positions saknas" },
      { status: 400 }
    );
  }

  // UPSERT = skapa eller uppdatera
  const { error } = await supabase.from("team_lineups").upsert({
    team_id: params.teamId,
    positions,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}