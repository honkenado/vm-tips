import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth-admin";
import { addHoursToIso, normalizeEmail } from "@/lib/access-overrides";

export async function GET() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: profiles, error: profilesError }, { data: invites, error: invitesError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, email, first_name, last_name, username, role, payment_status, prediction_unlock_until"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("late_registration_invites")
        .select("id, email, unlock_until, note, created_at")
        .order("unlock_until", { ascending: false }),
    ]);

  if (profilesError) {
    return NextResponse.json(
      { error: profilesError.message || "Kunde inte läsa profiler" },
      { status: 500 }
    );
  }

  if (invitesError) {
    return NextResponse.json(
      { error: invitesError.message || "Kunde inte läsa registreringsinbjudningar" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    profiles: profiles ?? [],
    invites: invites ?? [],
  });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const body = await request.json();

  const action = body?.action;

  if (action === "set_prediction_unlock") {
    const userId = String(body?.userId ?? "");
    const hours = Number(body?.hours ?? 0);

    if (!userId || !Number.isFinite(hours) || hours <= 0) {
      return NextResponse.json({ error: "Ogiltiga värden" }, { status: 400 });
    }

    const unlockUntil = addHoursToIso(hours);

    const { error } = await supabase
      .from("profiles")
      .update({ prediction_unlock_until: unlockUntil })
      .eq("id", userId);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Kunde inte uppdatera tips-upplåsning" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, unlockUntil });
  }

  if (action === "clear_prediction_unlock") {
    const userId = String(body?.userId ?? "");

    if (!userId) {
      return NextResponse.json({ error: "Saknar userId" }, { status: 400 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ prediction_unlock_until: null })
      .eq("id", userId);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Kunde inte rensa tips-upplåsning" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  if (action === "create_late_registration_invite") {
    const email = normalizeEmail(String(body?.email ?? ""));
    const hours = Number(body?.hours ?? 0);
    const note = body?.note ? String(body.note) : null;

    if (!email || !email.includes("@") || !Number.isFinite(hours) || hours <= 0) {
      return NextResponse.json({ error: "Ogiltig e-post eller tid" }, { status: 400 });
    }

    const unlockUntil = addHoursToIso(hours);

    const { error } = await supabase.from("late_registration_invites").upsert(
      {
        email,
        unlock_until: unlockUntil,
        note,
        created_by: admin.id,
      },
      { onConflict: "email" }
    );

    if (error) {
      return NextResponse.json(
        { error: error.message || "Kunde inte skapa sen registrering" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, unlockUntil });
  }

  if (action === "delete_late_registration_invite") {
    const inviteId = String(body?.inviteId ?? "");

    if (!inviteId) {
      return NextResponse.json({ error: "Saknar inviteId" }, { status: 400 });
    }

    const { error } = await supabase
      .from("late_registration_invites")
      .delete()
      .eq("id", inviteId);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Kunde inte ta bort sen registrering" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Okänd action" }, { status: 400 });
}