import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Body = {
  leagueId?: string;
  invitedUserId?: string;
};

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

    const body = (await req.json()) as Body;
    const leagueId = body.leagueId?.trim();
    const invitedUserId = body.invitedUserId?.trim();

    if (!leagueId || !invitedUserId) {
      return NextResponse.json(
        { error: "leagueId och invitedUserId krävs" },
        { status: 400 }
      );
    }

    if (user.id === invitedUserId) {
      return NextResponse.json(
        { error: "Du kan inte bjuda in dig själv" },
        { status: 400 }
      );
    }

    const { data: league, error: leagueError } = await supabase
      .from("leagues")
      .select("id, name, created_by")
      .eq("id", leagueId)
      .single();

    if (leagueError || !league) {
      return NextResponse.json({ error: "Ligan hittades inte" }, { status: 404 });
    }

    if (league.created_by !== user.id) {
      return NextResponse.json(
        { error: "Endast skaparen av ligan kan bjuda in" },
        { status: 403 }
      );
    }

    const { data: existingMember, error: memberCheckError } = await supabase
      .from("league_members")
      .select("league_id")
      .eq("league_id", leagueId)
      .eq("user_id", invitedUserId)
      .maybeSingle();

    if (memberCheckError) {
      console.error("Fel vid medlemskontroll:", memberCheckError);
      return NextResponse.json(
        { error: "Kunde inte kontrollera medlemskap" },
        { status: 500 }
      );
    }

    if (existingMember) {
      return NextResponse.json(
        { error: "Användaren är redan medlem i ligan" },
        { status: 400 }
      );
    }

    const { data: existingInvite, error: inviteCheckError } = await supabase
      .from("league_invites")
      .select("id")
      .eq("league_id", leagueId)
      .eq("invited_user_id", invitedUserId)
      .eq("status", "pending")
      .maybeSingle();

    if (inviteCheckError) {
      console.error("Fel vid kontroll av befintlig inbjudan:", inviteCheckError);
      return NextResponse.json(
        { error: "Kunde inte kontrollera befintliga inbjudningar" },
        { status: 500 }
      );
    }

    if (existingInvite) {
      return NextResponse.json(
        { error: "Inbjudan är redan skickad" },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase.from("league_invites").insert({
      league_id: leagueId,
      invited_by: user.id,
      invited_user_id: invitedUserId,
      status: "pending",
    });

    if (insertError) {
      console.error("Fel vid skapande av inbjudan:", insertError);
      return NextResponse.json(
        { error: "Kunde inte skapa inbjudan" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Serverfel i /api/leagues/invite:", error);
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}