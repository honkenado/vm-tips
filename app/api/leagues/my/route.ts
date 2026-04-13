import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type LeagueRow = {
  id: string;
  name: string;
  join_code: string;
  created_by: string | null;
  created_at: string | null;
};

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Inte inloggad" }, { status: 401 });
    }

    const { data: memberRows, error: memberError } = await supabase
      .from("league_members")
      .select("league_id")
      .eq("user_id", user.id);

    if (memberError) {
      console.error("Fel vid hämtning av league_members:", memberError);
      return NextResponse.json(
        { error: "Kunde inte hämta ligor" },
        { status: 500 }
      );
    }

    const memberLeagueIds = Array.from(
      new Set((memberRows ?? []).map((row) => row.league_id).filter(Boolean))
    );

    let memberLeagues: LeagueRow[] = [];

    if (memberLeagueIds.length > 0) {
      const { data: leaguesByMembership, error: leaguesByMembershipError } =
        await supabase
          .from("leagues")
          .select("id, name, join_code, created_by, created_at")
          .in("id", memberLeagueIds)
          .order("created_at", { ascending: false });

      if (leaguesByMembershipError) {
        console.error(
          "Fel vid hämtning av medlemsligor:",
          leaguesByMembershipError
        );
        return NextResponse.json(
          { error: "Kunde inte hämta ligor" },
          { status: 500 }
        );
      }

      memberLeagues = (leaguesByMembership ?? []) as LeagueRow[];
    }

    const { data: ownedLeagues, error: ownedError } = await supabase
      .from("leagues")
      .select("id, name, join_code, created_by, created_at")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (ownedError) {
      console.error("Fel vid hämtning av ägda ligor:", ownedError);
      return NextResponse.json(
        { error: "Kunde inte hämta ligor" },
        { status: 500 }
      );
    }

    const mergedMap = new Map<string, LeagueRow>();

    for (const league of [...(ownedLeagues ?? []), ...memberLeagues]) {
      if (!league?.id) continue;
      mergedMap.set(league.id, league as LeagueRow);
    }

    const mergedLeagues = Array.from(mergedMap.values()).sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

    const leagues: LeagueRow[] = [
      {
        id: "main",
        name: "Huvudligan",
        join_code: "MAIN",
        created_by: null,
        created_at: null,
      },
      ...mergedLeagues,
    ];

    return NextResponse.json({ leagues });
  } catch (error) {
    console.error("Serverfel i /api/leagues/my:", error);
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}