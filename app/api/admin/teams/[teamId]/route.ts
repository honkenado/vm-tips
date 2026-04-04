import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ teamId: string }>;
};

async function checkAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      status: 401,
      error: "Ej inloggad",
      supabase,
    };
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

  return {
    ok: true as const,
    supabase,
  };
}

export async function PATCH(req: Request, context: RouteContext) {
  const { teamId } = await context.params;
  const auth = await checkAdmin();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();

  const payload = {
    name: body.name ?? null,
    slug: body.slug ?? null,
    group_letter: body.group_letter ?? null,
    fifa_rank: body.fifa_rank ?? null,
    coach: body.coach ?? null,
    confederation: body.confederation ?? null,
    short_description: body.short_description ?? null,
    qualification_summary: body.qualification_summary ?? null,
    squad_status: body.squad_status ?? null,
    source: body.source ?? null,
    formation: body.formation ?? null,
    key_players: body.key_players ?? [],
  };

  const { error } = await auth.supabase
    .from("teams")
    .update(payload)
    .eq("id", teamId);

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        debug: { teamId, payload },
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Laget uppdaterades",
  });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { teamId } = await context.params;
  const auth = await checkAdmin();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { error } = await auth.supabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}