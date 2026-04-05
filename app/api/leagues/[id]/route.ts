import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Inte inloggad" }, { status: 401 });
    }

    const leagueParam = id?.trim();

    if (!leagueParam) {
      return NextResponse.json({ error: "Ogiltig liga" }, { status: 400 });
    }

    if (leagueParam.toLowerCase() === "main") {
      return NextResponse.json({
        league: {
          id: "main",
          name: "Huvudligan",
          join_code: "MAIN",
          created_by: null,
          created_at: null,
        },
        members: [],
        isMainLeague: true,
      });
    }

    let league: {
      id: string;
      name: string;
      join_code: string;
      created_by: string | null;
      created_at: string | null;
    } | null = null;

    const { data: leagueById, error: leagueByIdError } = await supabase
      .from("leagues")
      .select("id, name, join_code, created_by, created_at")
      .eq("id", leagueParam)
      .maybeSingle();

    if (leagueByIdError) {
      console.error("Fel vid lookup på league id:", leagueByIdError);
    }

    if (leagueById) {
      league = leagueById;
    } else {
      const { data: leagueByCode, error: leagueByCodeError } = await supabase
        .from("leagues")
        .select("id, name, join_code, created_by, created_at")
        .eq("join_code", leagueParam.toUpperCase())
        .maybeSingle();

      if (leagueByCodeError) {
        console.error("Fel vid lookup på join_code:", leagueByCodeError);
      }

      if (leagueByCode) {
        league = leagueByCode;
      }
    }

    if (!league) {
      return NextResponse.json({ error: "Liga hittades inte" }, { status: 404 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from("league_members")
      .select("id")
      .eq("league_id", league.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) {
      console.error("Fel vid medlemskapskontroll:", membershipError);
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
      .eq("league_id", league.id);

    if (membersError) {
      console.error("Fel vid hämtning av ligamedlemmar:", membersError);
      return NextResponse.json(
        { error: "Kunde inte hämta ligamedlemmar" },
        { status: 500 }
      );
    }

    const members = (memberRows ?? [])
      .map((row: any) => {
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
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
      isMainLeague: false,
    });
  } catch (error) {
    console.error("Fel i league route:", error);
    return NextResponse.json(
      { error: "Något gick fel när ligan hämtades" },
      { status: 500 }
    );
  }
}