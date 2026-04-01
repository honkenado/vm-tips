import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    return NextResponse.json({ error: "Ingen behörighet" }, { status: 403 });
  }

  const { data: teams, error } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      slug,
      group_letter,
      fifa_rank,
      coach,
      confederation,
      short_description,
      qualification_summary,
      squad_status,
      source,
      formation,
      key_players
    `)
    .order("group_letter", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ teams: teams ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    return NextResponse.json({ error: "Ingen behörighet" }, { status: 403 });
  }

  const body = await req.json();

  const { error } = await supabase.from("teams").insert({
    name: body.name,
    slug: body.slug,
    group_letter: body.group_letter,
    fifa_rank: body.fifa_rank,
    coach: body.coach,
    confederation: body.confederation,
    short_description: body.short_description,
    qualification_summary: body.qualification_summary,
    squad_status: body.squad_status,
    source: body.source,
    formation: body.formation,
    key_players: body.key_players ?? [],
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}