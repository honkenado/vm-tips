import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function generateJoinCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < length; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

async function generateUniqueJoinCode(supabase: Awaited<ReturnType<typeof createClient>>) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateJoinCode(6);

    const { data } = await supabase
      .from("leagues")
      .select("id")
      .eq("join_code", code)
      .maybeSingle();

    if (!data) {
      return code;
    }
  }

  throw new Error("Kunde inte skapa unik ligakod");
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Inte inloggad" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, payment_status")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profil hittades inte" }, { status: 404 });
    }

    if (profile.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Endast betalande deltagare kan skapa egna ligor" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const rawName = typeof body.name === "string" ? body.name : "";
    const name = rawName.trim();

    if (name.length < 3) {
      return NextResponse.json(
        { error: "Ligans namn måste vara minst 3 tecken" },
        { status: 400 }
      );
    }

    if (name.length > 40) {
      return NextResponse.json(
        { error: "Ligans namn får vara max 40 tecken" },
        { status: 400 }
      );
    }

    const joinCode = await generateUniqueJoinCode(supabase);

    const { data: league, error: leagueError } = await supabase
      .from("leagues")
      .insert({
        name,
        created_by: user.id,
        join_code: joinCode,
      })
      .select("id, name, created_by, join_code, created_at")
      .single();

    if (leagueError || !league) {
      return NextResponse.json(
        { error: "Kunde inte skapa ligan" },
        { status: 500 }
      );
    }

    const { error: memberError } = await supabase.from("league_members").insert({
      league_id: league.id,
      user_id: user.id,
    });

    if (memberError) {
      return NextResponse.json(
        { error: "Ligan skapades men medlem kunde inte läggas till" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      league,
      message: "Liga skapad",
    });
  } catch (error) {
    console.error("Fel i create league:", error);
    return NextResponse.json(
      { error: "Något gick fel när ligan skapades" },
      { status: 500 }
    );
  }
}