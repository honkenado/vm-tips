import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profil hittades inte" }, { status: 404 });
    }

    const body = await req.json();
    const rawCode = typeof body.joinCode === "string" ? body.joinCode : "";
    const joinCode = rawCode.trim().toUpperCase();

    if (!joinCode) {
      return NextResponse.json({ error: "Du måste ange en ligakod" }, { status: 400 });
    }

    const { data: league, error: leagueError } = await supabase
      .from("leagues")
      .select("id, name, join_code")
      .eq("join_code", joinCode)
      .maybeSingle();

    if (leagueError) {
      return NextResponse.json({ error: "Kunde inte söka efter liga" }, { status: 500 });
    }

    if (!league) {
      return NextResponse.json({ error: "Ingen liga hittades med den koden" }, { status: 404 });
    }

    const { error: memberError } = await supabase
      .from("league_members")
      .insert({
        league_id: league.id,
        user_id: user.id,
      });

    if (memberError) {
      if (memberError.code === "23505") {
        return NextResponse.json(
          { error: "Du är redan med i den här ligan" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Kunde inte gå med i ligan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Du gick med i ligan",
      league,
    });
  } catch (error) {
    console.error("Fel i join league:", error);
    return NextResponse.json(
      { error: "Något gick fel när du skulle gå med i ligan" },
      { status: 500 }
    );
  }
}