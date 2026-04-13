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

    const { data: leagues, error: leagueError } = await supabase
      .from("leagues")
      .select("id, created_by")
      .eq("id", leagueId);

    if (leagueError) {
      console.error("Fel vid hämtning av liga:", leagueError);
      return NextResponse.json({ error: "Kunde inte hämta ligan" }, { status: 500 });
    }

    const league = (leagues ?? [])[0];

    if (!league) {
      return NextResponse.json({ error: "Ligan hittades inte" }, { status: 404 });
    }

    if (league.created_by !== user.id) {
      return NextResponse.json(
        { error: "Endast ligans skapare kan ångra inbjudningar" },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from("league_invites")
      .delete()
      .eq("league_id", leagueId)
      .eq("invited_by", user.id)
      .eq("invited_user_id", invitedUserId)
      .eq("status", "pending");

    if (deleteError) {
      console.error("Fel vid borttagning av inbjudan:", deleteError);
      return NextResponse.json(
        { error: "Kunde inte ångra inbjudan" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Serverfel i /api/leagues/invites/cancel:", error);
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}