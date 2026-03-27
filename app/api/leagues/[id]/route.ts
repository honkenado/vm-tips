import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Inte inloggad" }, { status: 401 });
    }

    const leagueId = params.id;

    const { data: membership, error: membershipError } = await supabase
      .from("league_members")
      .select("id")
      .eq("league_id", leagueId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) {
      return NextResponse.json(
        { error: "Kunde inte verifiera ligamedlemskap" },
        { status: 500 }
      );
    }

    if (!membership) {
      return NextResponse.json(
        { error: "Du har inte access till den här ligan" },
        { status: 403 }
      );
    }

    const { data: league, error: leagueError } = await supabase
      .from("leagues")
      .select("id, name, join_code, created_by, created_at")
      .eq("id", leagueId)
      .single();

    if (leagueError || !league) {
      return NextResponse.json({ error: "Liga hittades inte" }, { status: 404 });
    }

    const { data: memberRows, error: membersError } = await supabase
      .from("league_members")
      .select(
        `
          user_id,
          joined_at,
          profiles (
            id,
            username,
            first_name,
            last_name,
            payment_status
          )
        `
      )
      .eq("league_id", leagueId);

    if (membersError) {
      return NextResponse.json(
        { error: "Kunde inte hämta ligamedlemmar" },
        { status: 500 }
      );
    }

    const members = (memberRows ?? [])
      .map((row: any) => {
        const profile = row.profiles;

        if (!profile) return null;

        return {
          id: profile.id as string,
          username: profile.username as string | null,
          first_name: profile.first_name as string | null,
          last_name: profile.last_name as string | null,
          payment_status: profile.payment_status as "paid" | "unpaid" | null,
          joined_at: row.joined_at as string | null,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      league,
      members,
    });
  } catch (error) {
    console.error("Fel i league route:", error);
    return NextResponse.json(
      { error: "Något gick fel när ligan hämtades" },
      { status: 500 }
    );
  }
}