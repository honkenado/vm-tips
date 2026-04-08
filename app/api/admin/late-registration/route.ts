import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await request.json();
  const email = body.email?.toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email saknas" }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 timmar

  const { error } = await supabase.from("late_registration_invites").insert({
    email,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    expiresAt,
  });
}