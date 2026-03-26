import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const TOURNAMENT_SLUG = "world-cup-2026";

async function getTournamentId() {
  const { data, error } = await supabaseAdmin
    .from("tournaments")
    .select("id")
    .eq("slug", TOURNAMENT_SLUG)
    .single();

  if (error || !data) {
    throw new Error("Kunde inte hitta turneringen");
  }

  return data.id as string;
}

async function checkAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Inte inloggad" }, { status: 401 }) };
  }

  const { data: me, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !me?.is_admin) {
    return { error: NextResponse.json({ error: "Ingen behörighet" }, { status: 403 }) };
  }

  return { user };
}

export async function GET() {
  const auth = await checkAdmin();
  if ("error" in auth) return auth.error;

  try {
    const tournamentId = await getTournamentId();

    const { data, error } = await supabaseAdmin
      .from("tournament_results")
      .select("id, tournament_id, group_stage, knockout")
      .eq("tournament_id", tournamentId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Kunde inte läsa resultat" }, { status: 500 });
    }

    return NextResponse.json({
      results: data ?? {
        tournament_id: tournamentId,
        group_stage: [],
        knockout: {},
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Något gick fel" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await checkAdmin();
  if ("error" in auth) return auth.error;

  try {
    const tournamentId = await getTournamentId();
    const body = await req.json();

    const { group_stage, knockout } = body as {
      group_stage?: unknown;
      knockout?: unknown;
    };

    const payload = {
      tournament_id: tournamentId,
      group_stage: group_stage ?? [],
      knockout: knockout ?? {},
    };

    const { data, error } = await supabaseAdmin
      .from("tournament_results")
      .upsert(payload, { onConflict: "tournament_id" })
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Kunde inte spara resultat" }, { status: 500 });
    }

    return NextResponse.json({ success: true, results: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Något gick fel" }, { status: 500 });
  }
}