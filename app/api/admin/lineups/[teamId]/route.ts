import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_lineups")
    .select("*")
    .eq("team_id", teamId)
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
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const supabase = await createClient();
  const body = await req.json();

  const { positions } = body;

  if (!positions) {
    return NextResponse.json(
      { error: "Positions saknas" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("team_lineups").upsert({
    team_id: teamId,
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