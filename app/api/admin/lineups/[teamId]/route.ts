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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const auth = await checkAdmin();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: lineup, error: lineupError } = await auth.supabase
    .from("team_lineups")
    .select("id, team_id, lineup_name, formation")
    .eq("team_id", teamId)
    .eq("lineup_name", "Startelva")
    .maybeSingle();

  if (lineupError) {
    return NextResponse.json({ error: lineupError.message }, { status: 400 });
  }

  if (!lineup) {
    return NextResponse.json({ lineup: null, slots: [] });
  }

  const { data: slots, error: slotsError } = await auth.supabase
    .from("team_lineup_slots")
    .select("id, lineup_id, slot_key, role_label, x_pos, y_pos, player_id")
    .eq("lineup_id", lineup.id);

  if (slotsError) {
    return NextResponse.json({ error: slotsError.message }, { status: 400 });
  }

  return NextResponse.json({
    lineup,
    slots: slots ?? [],
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const auth = await checkAdmin();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();

  const formation = body.formation ?? "4-3-3";
  const lineupName = body.lineup_name ?? "Startelva";
  const slots = Array.isArray(body.slots) ? body.slots : [];

  const { data: existingLineup, error: existingError } = await auth.supabase
    .from("team_lineups")
    .select("id")
    .eq("team_id", teamId)
    .eq("lineup_name", lineupName)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 });
  }

  let lineupId = existingLineup?.id ?? null;

  if (!lineupId) {
    const { data: insertedLineup, error: insertLineupError } = await auth.supabase
      .from("team_lineups")
      .insert({
        team_id: teamId,
        lineup_name: lineupName,
        formation,
      })
      .select("id")
      .single();

    if (insertLineupError || !insertedLineup) {
      return NextResponse.json(
        { error: insertLineupError?.message || "Kunde inte skapa lineup" },
        { status: 400 }
      );
    }

    lineupId = insertedLineup.id;
  } else {
    const { error: updateLineupError } = await auth.supabase
      .from("team_lineups")
      .update({ formation })
      .eq("id", lineupId);

    if (updateLineupError) {
      return NextResponse.json(
        { error: updateLineupError.message },
        { status: 400 }
      );
    }
  }

  const { error: deleteSlotsError } = await auth.supabase
    .from("team_lineup_slots")
    .delete()
    .eq("lineup_id", lineupId);

  if (deleteSlotsError) {
    return NextResponse.json(
      { error: deleteSlotsError.message },
      { status: 400 }
    );
  }

  if (slots.length > 0) {
    const payload = slots.map((slot: any) => ({
      lineup_id: lineupId,
      slot_key: slot.slot_key,
      role_label: slot.role_label,
      x_pos: slot.x_pos,
      y_pos: slot.y_pos,
      player_id: slot.player_id ?? null,
    }));

    const { error: insertSlotsError } = await auth.supabase
      .from("team_lineup_slots")
      .insert(payload);

    if (insertSlotsError) {
      return NextResponse.json(
        { error: insertSlotsError.message },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ ok: true, lineup_id: lineupId });
}