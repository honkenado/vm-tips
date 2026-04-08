import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeEmail, hasActiveTimeOverride } from "@/lib/access-overrides";

function isRegistrationDeadlinePassed() {
  const now = new Date();
  const year = now.getFullYear();
  return now > new Date(year, 5, 10, 23, 59, 59);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const email = normalizeEmail(String(body?.email ?? ""));

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Ogiltig e-post" }, { status: 400 });
  }

  const deadlinePassed = isRegistrationDeadlinePassed();

  if (!deadlinePassed) {
    return NextResponse.json({
      allowed: true,
      reason: "before_deadline",
      unlockUntil: null,
    });
  }

  const { data, error } = await supabase
    .from("late_registration_invites")
    .select("unlock_until")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message || "Kunde inte kontrollera registrering" },
      { status: 500 }
    );
  }

  const allowed = hasActiveTimeOverride(data?.unlock_until ?? null);

  return NextResponse.json({
    allowed,
    reason: allowed ? "late_invite" : "deadline_passed",
    unlockUntil: data?.unlock_until ?? null,
  });
}