import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Inte inloggad" }, { status: 401 });
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!me?.is_admin) {
    return NextResponse.json({ error: "Ingen behörighet" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, first_name, last_name, email, payment_code, payment_status, is_admin")
    .order("payment_status", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Kunde inte läsa användare" }, { status: 500 });
  }

  return NextResponse.json({ profiles: data });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Inte inloggad" }, { status: 401 });
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!me?.is_admin) {
    return NextResponse.json({ error: "Ingen behörighet" }, { status: 403 });
  }

  const body = await req.json();
  const { profileId, paymentStatus } = body;

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ payment_status: paymentStatus })
    .eq("id", profileId);

  if (error) {
    return NextResponse.json({ error: "Kunde inte uppdatera" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}