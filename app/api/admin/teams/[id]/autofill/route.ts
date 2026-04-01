import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { autofillTeamInfo } from "@/lib/team-import/autofill-team";

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

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await checkAdmin();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: team, error: teamError } = await auth.supabase
    .from("teams")
    .select("id, name, slug, short_description, confederation, source")
    .eq("id", id)
    .single();

  if (teamError || !team) {
    return NextResponse.json(
      { error: "Kunde inte läsa laget" },
      { status: 404 }
    );
  }

  const autofill = await autofillTeamInfo(team);

  const { error: updateError } = await auth.supabase
    .from("teams")
    .update({
      confederation: autofill.confederation ?? team.confederation ?? null,
      short_description:
        autofill.short_description ?? team.short_description ?? null,
      source: autofill.source ?? team.source ?? null,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    updated: {
      confederation: autofill.confederation ?? null,
      short_description: autofill.short_description ?? null,
      source: autofill.source ?? null,
    },
  });
}